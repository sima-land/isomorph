/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { ConfigSource, createConfigSource } from '../../../config';
import { Logger, createLogger } from '../../../log';
import { Handler, Middleware } from '../../../http';
import { providePinoHandler } from '../../node/providers';
import { route, router } from '@krutoo/fetch-tools';
import { getCurrentHub, init, runWithAsyncContext } from '@sentry/bun';
import { createSentryHandler } from '../../../log/handler/sentry';
import { provideFetch } from '../../isomorphic/providers';
import { ServerHandler, ServerMiddleware } from '../../server/types';
import { statsHandler } from '../utils';
import { getHealthCheck } from '../../server/utils/get-health-check';
import { getServeLogging } from '../../server/utils/get-serve-logging';
import { getServeErrorLogging } from '../../server/utils/get-serve-error-logging';
import { getServeMeasuring } from '../../server/utils/get-serve-measuring';
import { applyServerMiddleware } from '../../server/utils/apply-server-middleware';
import PromClient from 'prom-client';

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
    const serviceRoutes = resolve(KnownToken.Http.Serve.serviceRoutes);

    const enhance = applyServerMiddleware(...middleware);

    return router(
      // маршруты с промежуточными слоями
      ...routes.map(([pattern, handler]) => {
        const enhancedHandler = enhance(handler);

        return route.get(pattern, request =>
          enhancedHandler(request, { events: new EventTarget() }),
        );
      }),

      // @todo вместо routes обрабатывать pageRoutes с помощью route.get() из новой версии fetch-tools (для явности)
      // @todo также добавить apiRoutes и обрабатывать их с помощью с помощью route()?

      // служебные маршруты (без промежуточных слоев)
      ...serviceRoutes.map(([pattern, handler]) =>
        route(pattern, request => handler(request, { events: new EventTarget() })),
      ),
    );
  },

  serviceRoutes(): Array<[string, ServerHandler]> {
    return [
      // служебные маршруты (без промежуточных слоев)
      ['/healthcheck', getHealthCheck()],
      ['/stats', statsHandler()],
    ];
  },

  serveMiddleware(resolve: Resolve): ServerMiddleware[] {
    const config = resolve(KnownToken.Config.base);
    const logger = resolve(KnownToken.logger);

    return [
      // ВАЖНО: изолируем хлебные крошки чтобы они группировались по входящим запросам
      (request, next) => runWithAsyncContext(async () => next(request)),

      // ВАЖНО: слой логирования ошибки ПЕРЕД остальными слоями чтобы не упустить ошибки выше
      getServeErrorLogging(logger),

      // @todo tracing

      // метрики
      getServeMeasuring(config),

      // ВАЖНО: слой логирования запроса и ответа ПОСЛЕ остальных слоев чтобы использовать актуальные данные
      getServeLogging(logger),
    ];
  },

  serveMetrics(): Handler {
    // @todo задействовать когда Bun реализует pref_hooks.monitorEventLoopDelay (https://github.com/siimon/prom-client/issues/570)
    // PromClient.collectDefaultMetrics();

    return router(
      route.get('/', async () => {
        const metrics = await PromClient.register.metrics();
        const headers = new Headers();

        headers.set('Content-Type', PromClient.register.contentType);

        return new Response(metrics, { headers });
      }),
    );
  },
} as const;
