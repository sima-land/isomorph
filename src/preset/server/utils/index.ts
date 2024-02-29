import type { BaseConfig } from '../../../config';
import type { Middleware } from '../../../http';
import type { ServerEnhancer, ServerMiddleware } from '../types';
import { SpanStatusCode, type Context, type Tracer } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { hideFirstId } from '../../node/node/utils/http-client';

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
 * Вернет новый промежуточный слой трассировки для fetch.
 * @param tracer Трассировщик.
 * @param rootContext Контекст.
 * @return Промежуточный слой трассировки.
 */
export function fetchTracingMiddleware(tracer: Tracer, rootContext: Context): Middleware {
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

/** @inheritdoc */
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
