/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { ConfigSource, createConfigSource } from '../../../config';
import { Logger, createLogger } from '../../../log';
import {
  Handler,
  Middleware,
  StatusError,
  applyMiddleware,
  configureFetch,
  log,
  validateStatus,
} from '../../../http';
import { FetchLogging, ServeLogging, healthCheck } from '../utils';
import { providePinoHandler } from '../../node/node/providers';
import { route, router } from '@krutoo/fetch-tools';

export const ProvideBun = {
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

  fetchMiddleware(resolve: Resolve): Middleware[] {
    const logger = resolve(KnownToken.logger);

    return [
      validateStatus(status => status >= 200 && status < 300, {
        getThrowable: response => new StatusError(response),
      }),
      log(new FetchLogging(logger)),
      // @todo metrics (PresetHandler)
      // @todo tracing (PresetHandler)
      // @todo cookie from incoming request (PresetHandler)
      // @todo "simaland-*" headers from incoming request (PresetHandler)
    ];
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
      log(new ServeLogging(logger)),
      // @todo metrics
      // @todo tracing
    ];
  },
} as const;
