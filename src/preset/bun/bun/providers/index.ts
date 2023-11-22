/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { Resolve } from '../../../../di';
import { KnownToken } from '../../../../tokens';
import { ConfigSource, createConfigSource } from '../../../../config';
import { Logger, createLogger } from '../../../../log';
import { Handler, Middleware, applyMiddleware, configureFetch, log } from '../../../../http';
import { ServeLogging, healthCheck } from '../utils';
import { providePinoHandler } from '../../../node/node/providers';
import { route, router } from '@krutoo/fetch-tools';
import { getCurrentHub, init, runWithAsyncContext } from '@sentry/bun';
import { createSentryHandler } from '../../../../log/handler/sentry';

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

  fetch(resolve: Resolve): typeof fetch {
    const middleware = resolve(KnownToken.Http.Fetch.middleware);

    return configureFetch(fetch, applyMiddleware(...middleware));
  },

  fetchMiddleware(): Middleware[] {
    return [];
  },

  serve(resolve: Resolve): Handler {
    const middleware = resolve(KnownToken.Http.Serve.middleware);
    const routes = resolve(KnownToken.Http.Serve.routes);

    const enhance = applyMiddleware(...middleware);

    return router(
      // маршруты с промежуточными слоями
      ...routes.map(([pathname, handler]) => route(pathname, enhance(handler))),

      // служебные маршруты (без промежуточных слоев)
      route('/healthcheck', healthCheck()),
    );
  },

  serveMiddleware(resolve: Resolve): Middleware[] {
    const logger = resolve(KnownToken.logger);

    return [
      // ВАЖНО: изолируем хлебные крошки чтобы они группировались по входящим запросам
      (request, next) => runWithAsyncContext(async () => next(request)),

      // @todo metrics
      // @todo tracing

      // ВАЖНО: log должен быть последним слоем
      log(new ServeLogging(logger)),
    ];
  },
} as const;
