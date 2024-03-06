import type { BaseConfig } from '../../../config';
import { Handler, Middleware, FetchUtil, log } from '../../../http';
import type { ServerEnhancer, ServerMiddleware } from '../types';
import { SpanStatusCode, type Context, type Tracer } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { hideFirstId } from '../../node/node/utils/http-client';
import { DetailedError, Logger } from '../../../log';
import { toMilliseconds } from '../../../utils';
import { RESPONSE_EVENT_TYPE } from '../../isomorphic/constants';
import PromClient from 'prom-client';

/**
 * Определяет формат ответа для страницы (html-верстки).
 * Вернет "json" - если заголовок запроса "accept" содержит "application/json".
 * Вернет "html" во всех остальных случаях.
 * @param request Запрос.
 * @return Формат.
 */
export function getPageResponseFormat(request: Request): 'html' | 'json' {
  let result: 'html' | 'json' = 'html';

  if ((request.headers.get('accept') || '').toLowerCase().includes('application/json')) {
    result = 'json';
  }

  return result;
}

/**
 * Вернет заголовки, которые должны содержаться в исходящих http-запросах при обработке входящего http-запроса.
 * @param config Конфигурация.
 * @param request Входящий запрос.
 * @return Заголовки.
 */
export function getForwardedHeaders(config: BaseConfig, request: Request): Headers {
  const result = new Headers();

  // user agent
  result.set('User-Agent', `simaland-${config.appName}/${config.appVersion}`);

  // client ip
  const clientIp = getClientIp(request);

  if (clientIp) {
    result.set('X-Client-Ip', clientIp);
  }

  // service headers
  request.headers.forEach((headerValue, headerName) => {
    if (
      headerName.toLowerCase().startsWith('simaland-') &&
      headerName.toLowerCase() !== 'simaland-params'
    ) {
      result.set(headerName, headerValue);
    }
  });

  return result;
}

/**
 * Вернет строку с IP на основе заголовков запроса.
 * @param request Запрос.
 * @return IP или null.
 */
export function getClientIp(request: Request): string | null {
  const headerValue = request.headers.get('x-client-ip') || request.headers.get('x-forwarded-for');

  return headerValue;
}

/**
 * Возвращает новый обработчик входящих запросов.
 * Обработчик возвращает ответ в формате JSON, тело - объект с полем "uptime" типа number.
 * @return Обработчик.
 */
export function healthCheck(): Handler {
  const startTime = Date.now();

  return () =>
    new Response(JSON.stringify({ uptime: Date.now() - startTime }), {
      headers: {
        'content-type': 'application/json',
      },
    });
}

/**
 * Возвращает новый промежуточный слой для логирования обработки входящего http-запроса.
 * @param logger Logger.
 * @return Промежуточный слой.
 */
export function getServeLogging(logger: Logger): Middleware {
  return async (request, next) => {
    const start = process.hrtime.bigint();

    logger.info({
      type: 'http.request[incoming]',
      route: request.url,
      method: request.method,
      remote_ip: getClientIp(request),
    });

    const response = await next(request);

    const finish = process.hrtime.bigint();

    logger.info({
      type: 'http.response[outgoing]',
      route: request.url,
      method: request.method,
      status: response.status,
      remote_ip: getClientIp(request),
      latency: toMilliseconds(finish - start),
    });

    return response;
  };
}

/**
 * Возвращает новый промежуточный слой для логирования ошибки при обработке входящего http-запроса.
 * @param logger Logger.
 * @return Промежуточный слой.
 */
export function getServeErrorLogging(logger: Logger) {
  return log({
    onCatch: ({ request, error }) => {
      logger.error(
        new DetailedError(String(error), {
          level: 'error',
          context: [
            {
              key: 'Incoming request details',
              data: {
                url: FetchUtil.withoutParams(request.url),
                method: request.method,
                headers: Object.fromEntries(request.headers.entries()),
                params: Object.fromEntries(new URL(request.url).searchParams.entries()),
                // @todo data
              },
            },
          ],
        }),
      );
    },
  });
}

/**
 * Возвращает новый промежуточный слой метрки входящего http-запроса.
 * @param config Конфигурация.
 * @return Промежуточный слой.
 */
export function getServeMeasuring(config: BaseConfig): ServerMiddleware {
  const ConventionalLabels = {
    HTTP_RESPONSE: ['version', 'route', 'code', 'method'],
    SSR: ['version', 'route', 'method'],
  } as const;

  // @todo скорее всего стоит сделать обертки над классами из PromClient чтобы вызывать у них методы замера а они уже сами вычисляли лейблы и тд
  const requestCount = new PromClient.Counter({
    name: 'http_request_count',
    help: 'Incoming HTTP request count',
    labelNames: ConventionalLabels.HTTP_RESPONSE,
  });

  const responseDuration = new PromClient.Histogram({
    name: 'http_response_duration_ms',
    help: 'Duration of incoming HTTP requests in ms',
    labelNames: ConventionalLabels.HTTP_RESPONSE,
    buckets: [30, 100, 200, 500, 1000, 2500, 5000, 10000],
  });

  const renderDuration = new PromClient.Histogram({
    name: 'render_duration_ms',
    help: 'Duration of SSR ms',
    labelNames: ConventionalLabels.SSR,
    buckets: [0.1, 15, 50, 100, 250, 500, 800, 1500],
  });

  /** @inheritdoc */
  const getResponseLabels = (req: Request, res: Response) =>
    ({
      version: config.appVersion,
      route: req.url,
      code: res.status,
      method: req.method,
    }) satisfies Record<(typeof ConventionalLabels.HTTP_RESPONSE)[number], string | number>;

  /** @inheritdoc */
  const getRenderLabels = (request: Request) =>
    ({
      version: config.appVersion,
      method: request.method,
      route: request.url,
    }) satisfies Record<(typeof ConventionalLabels.SSR)[number], string | number>;

  return async (request, next, context) => {
    const responseStart = process.hrtime.bigint();
    let renderStart = 0n;

    context.events.addEventListener(
      RESPONSE_EVENT_TYPE.renderStart,
      () => {
        renderStart = process.hrtime.bigint();
      },
      { once: true },
    );

    context.events.addEventListener(
      RESPONSE_EVENT_TYPE.renderFinish,
      () => {
        const renderFinish = process.hrtime.bigint();

        renderDuration.observe(
          getRenderLabels(request),
          toMilliseconds(renderFinish - renderStart),
        );
      },
      { once: true },
    );

    const response = await next(request);
    const responseFinish = process.hrtime.bigint();

    responseDuration.observe(
      getResponseLabels(request, response),
      toMilliseconds(responseFinish - responseStart),
    );

    requestCount.inc(getResponseLabels(request, response), 1);

    return response;
  };
}

/**
 * Вернет новый промежуточный слой трассировки для fetch.
 * @param tracer Трассировщик.
 * @param rootContext Контекст.
 * @return Промежуточный слой трассировки.
 */
export function getFetchTracing(tracer: Tracer, rootContext: Context): Middleware {
  return async (request, next) => {
    const [url, foundId] = hideFirstId(new URL(request.url).pathname);
    const span = tracer.startSpan(`HTTP ${request.method} ${url}`, undefined, rootContext);

    span.setAttributes({
      [SemanticAttributes.HTTP_URL]: url,
      [SemanticAttributes.HTTP_METHOD]: request.method,
      'request.params': JSON.stringify(new URL(request.url).searchParams),
      'request.headers': JSON.stringify(request.headers),

      // если нашли id - добавляем в теги
      ...(foundId && { 'request.id': foundId }),
    });

    try {
      const response = await next(request);

      span.end();

      return response;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'HTTP Request failed',
      });

      span.end();

      // не прячем ошибку
      throw error;
    }
  };
}

/**
 * @inheritdoc
 * @internal
 */
export function applyServerMiddleware(...list: ServerMiddleware[]): ServerEnhancer {
  return handler => {
    let result = handler;

    for (const item of list.reverse()) {
      const next = result;
      result = async (request, context) =>
        item(request, (req, ctx) => next(req, ctx ?? context), context);
    }

    return result;
  };
}
