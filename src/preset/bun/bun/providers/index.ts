/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { Resolve } from '../../../../di';
import { KnownToken } from '../../../../tokens';
import { ConfigSource, createConfigSource } from '../../../../config';
import { Logger, createLogger } from '../../../../log';
import { Handler, Middleware, applyMiddleware, configureFetch, log } from '../../../../http';
import { ServeLogging, healthCheck } from '../utils';
import { providePinoHandler } from '../../../node/node/providers';
import { route, router } from '@krutoo/fetch-tools';

export const BunProviders = {
  configSource(): ConfigSource {
    return createConfigSource(Bun.env);
  },

  logger(resolve: Resolve): Logger {
    const logger = createLogger();

    logger.subscribe(providePinoHandler(resolve));
    // @todo sentry

    return logger;
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
      // @todo metrics
      // @todo tracing

      // ВАЖНО: log должен быть последним слоем
      log(new ServeLogging(logger)),
    ];
  },
} as const;
