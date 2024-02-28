/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { Resolve } from '../../../../di';
import { KnownToken } from '../../../../tokens';
import { ConfigSource, createConfigSource } from '../../../../config';
import { Logger, createLogger } from '../../../../log';
import { Handler, Middleware, log } from '../../../../http';
import { ServeLogging } from '../utils';
import { providePinoHandler } from '../../../node/node/providers';
import { route, router } from '@krutoo/fetch-tools';
import { getCurrentHub, init, runWithAsyncContext } from '@sentry/bun';
import { createSentryHandler } from '../../../../log/handler/sentry';
import { healthCheck } from '../../../isomorphic/utils';
import { provideFetch } from '../../../isomorphic/providers';
import { toMilliseconds } from '../../../../utils';
import { ServerMiddleware } from '../../../server/types';
import { applyServerMiddleware } from '../../../server/utils';
import PromClient from 'prom-client';
import { RESPONSE_EVENT_TYPE } from '../../../isomorphic/constants';

export const BunProviders = {
  configSource(): ConfigSource {
    return createConfigSource(Bun.env);
  },

  logger(resolve: Resolve): Logger {
    const logger = createLogger();

    logger.subscribe(BunProviders.logHandlerPino(resolve));
    logger.subscribe(BunProviders.logHandlerSentry(resolve));

    return logger;
  },

  logHandlerPino(resolve: Resolve) {
    return providePinoHandler(resolve);
  },

  logHandlerSentry(resolve: Resolve) {
    const source = resolve(KnownToken.Config.source);

    init({
      dsn: source.require('SENTRY_DSN'),
      release: source.require('SENTRY_RELEASE'),
      environment: source.require('SENTRY_ENVIRONMENT'),
    });

    // ВАЖНО: передаем функцию чтобы брать текущий hub в момент вызова метода logger'а
    // это нужно чтобы хлебные крошки в ошибках Sentry группировались по запросам
    return createSentryHandler(getCurrentHub);
  },

  fetch: provideFetch,

  fetchMiddleware(): Middleware[] {
    return [];
  },

  serve(resolve: Resolve): Handler {
    const middleware = resolve(KnownToken.Http.Serve.middleware);
    const routes = resolve(KnownToken.Http.Serve.routes);

    const enhance = applyServerMiddleware(...middleware);

    return router(
      // маршруты с промежуточными слоями
      ...routes.map(([pathname, handler]) => {
        const enhancedHandler = enhance(handler);
        return route(pathname, request => enhancedHandler(request, { events: new EventTarget() }));
      }),

      // @todo вместо routes обрабатывать pageRoutes с помощью route.get() из новой версии fetch-tools (для явности)
      // @todo также добавить apiRoutes и обрабатывать их с помощью с помощью route()?

      // служебные маршруты (без промежуточных слоев)
      route('/healthcheck', healthCheck()),
    );
  },

  serveMiddleware(resolve: Resolve): ServerMiddleware[] {
    const config = resolve(KnownToken.Config.base);
    const logger = resolve(KnownToken.logger);

    const logging = new ServeLogging(logger);

    // @todo перенести в preset/server
    const ConventionalLabels = {
      HTTP_RESPONSE: ['version', 'route', 'code', 'method'],
      SSR: ['version', 'route', 'method'],
    } as const;

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

    const getLabels = (
      req: Request,
      res: Response,
    ): Record<(typeof ConventionalLabels.HTTP_RESPONSE)[number], string | number> => ({
      version: config.appVersion,
      route: req.url,
      code: res.status,
      method: req.method,
    });

    return [
      // ВАЖНО: изолируем хлебные крошки чтобы они группировались по входящим запросам
      (request, next) => runWithAsyncContext(async () => next(request)),

      // ВАЖНО: слой логирования ошибки ПЕРЕД остальными слоями чтобы не упустить ошибки выше
      log({
        onCatch: data => logging.onRequest(data),
      }),

      // @todo tracing

      // метрики
      async (request, next, context) => {
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
              {
                version: config.appVersion,
                method: request.method,
                route: request.url,
              },
              toMilliseconds(renderFinish - renderStart),
            );
          },
          { once: true },
        );

        const response = await next(request);
        const responseFinish = process.hrtime.bigint();

        responseDuration.observe(
          getLabels(request, response),
          toMilliseconds(responseFinish - responseStart),
        );

        requestCount.inc(getLabels(request, response), 1);

        return response;
      },

      // ВАЖНО: слой логирования запроса и ответа ПОСЛЕ остальных слоев чтобы использовать актуальные данные
      log({
        onRequest: data => logging.onRequest(data),
        onResponse: data => logging.onResponse(data),
      }),
    ];
  },

  serveMetrics(): Handler {
    // @todo задействовать когда Bun реализует pref_hooks.monitorEventLoopDelay (https://github.com/siimon/prom-client/issues/570)
    // PromClient.collectDefaultMetrics();

    // @todo здесь или в другом компоненте надо проверять путь и метод запроса
    return async () => {
      const metrics = await PromClient.register.metrics();
      const headers = new Headers();

      headers.set('Content-Type', PromClient.register.contentType);

      return new Response(metrics, { headers });
    };
  },
} as const;
