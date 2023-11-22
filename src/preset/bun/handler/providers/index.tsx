/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { renderToString } from 'react-dom/server';
import { Resolve } from '../../../../di';
import { KnownToken } from '../../../../tokens';
import { HelmetContext, RegularHelmet } from '../../../node/handler/utils';
import {
  Middleware,
  ResponseError,
  applyMiddleware,
  configureFetch,
  cookie,
  createCookieStore,
  defaultHeaders,
  log,
} from '../../../../http';
import { Fragment } from 'react';
import { FetchLogging } from '../../bun/utils';
import { getForwardedHeaders, getResponseFormat } from '../utils';

export const HandlerProviders = {
  handlerMain(resolve: Resolve) {
    const config = resolve(KnownToken.Config.base);
    const logger = resolve(KnownToken.logger);
    const assetsInit = resolve(KnownToken.Http.Handler.Page.assets);
    const render = resolve(KnownToken.Http.Handler.Page.render);
    const extras = resolve(KnownToken.Http.Handler.Response.specificExtras);
    const Helmet = resolve(KnownToken.Http.Handler.Page.helmet);
    const abortController = resolve(KnownToken.Http.Fetch.abortController);

    const getAssets = typeof assetsInit === 'function' ? assetsInit : () => assetsInit;

    const elementToString = (element: JSX.Element) => {
      // @todo dispatch renderStart event for metrics/tracing
      const result = renderToString(element);
      // @todo dispatch renderFinish event for metrics/tracing

      return result;
    };

    const handler = async (request: Request): Promise<Response> => {
      try {
        const assets = await getAssets();
        const meta = extras.getMeta();

        const jsx = (
          <HelmetContext.Provider value={{ title: config.appName, assets }}>
            <Helmet>{await render()}</Helmet>
          </HelmetContext.Provider>
        );

        switch (getResponseFormat(request)) {
          case 'html': {
            const headers = new Headers();

            headers.set('content-type', 'text/html');
            headers.set('simaland-bundle-js', assets.js);
            headers.set('simaland-bundle-css', assets.css);

            if (assets.criticalJs) {
              headers.set('simaland-critical-js', assets.criticalJs);
            }

            if (assets.criticalCss) {
              headers.set('simaland-critical-css', assets.criticalCss);
            }

            if (meta) {
              headers.set('simaland-meta', JSON.stringify(meta));
            }

            // ВАЖНО: DOCTYPE обязательно нужен так как влияет на то как браузер будет парсить html/css
            // ВАЖНО: DOCTYPE нужен только когда отдаем полноценную страницу
            if (config.env === 'development') {
              return new Response(`<!DOCTYPE html>${elementToString(jsx)}`, {
                headers,
              });
            } else {
              return new Response(elementToString(jsx), {
                headers,
              });
            }
          }

          case 'json': {
            const headers = new Headers();

            headers.set('content-type', 'application/json');

            return new Response(
              JSON.stringify({
                markup: elementToString(jsx),
                bundle_js: assets.js,
                bundle_css: assets.css,
                critical_js: assets.criticalJs,
                critical_css: assets.criticalCss,
                meta,
              }),
              { headers },
            );
          }
        }
      } catch (error) {
        let message: string;
        let statusCode = 500; // по умолчанию, если на этапе подготовки страницы что-то не так, отдаем 500

        if (error instanceof Error) {
          message = error.message;

          if (error instanceof ResponseError) {
            statusCode = error.statusCode;
          }
        } else {
          message = String(error);
        }

        logger.error(error);

        return new Response(message, {
          status: statusCode,
        });
      }
    };

    const enhancer = applyMiddleware(
      // отменяем запросы, исходящие в рамках обработчика
      async (request, next) => {
        const response = await next(request);

        abortController.abort();

        return response;
      },
    );

    return enhancer(handler);
  },

  pageHelmet(resolve: Resolve) {
    const config = resolve(KnownToken.Config.base);
    const { request } = resolve(KnownToken.Http.Handler.context);

    return config.env === 'development' && getResponseFormat(request) === 'html'
      ? RegularHelmet
      : Fragment;
  },

  specificParams(resolve: Resolve) {
    const context = resolve(KnownToken.Http.Handler.context);

    try {
      const headerValue = context.request.headers.get('simaland-params');

      return JSON.parse(headerValue ?? '{}');
    } catch {
      return {};
    }
  },

  fetch(resolve: Resolve): typeof fetch {
    const middleware = resolve(KnownToken.Http.Fetch.middleware);

    return configureFetch(fetch, applyMiddleware(...middleware));
  },

  fetchAbortController(): AbortController {
    return new AbortController();
  },

  fetchMiddleware(resolve: Resolve): Middleware[] {
    const config = resolve(KnownToken.Config.base);
    const logger = resolve(KnownToken.logger);
    const context = resolve(KnownToken.Http.Handler.context);
    const abortController = resolve(KnownToken.Http.Fetch.abortController);

    // @todo set-cookie в ответ от сервера (но только если во входящих ответах есть set-cookie)
    const cookieStore = createCookieStore(context.request.headers.get('cookie') ?? undefined);

    const logging = new FetchLogging(logger);

    abortController.signal.addEventListener(
      'abort',
      () => {
        logging.disabled = true;
      },
      { capture: true },
    );

    return [
      // ВАЖНО: слой логирования ошибки ПЕРЕД остальными слоями чтобы не упустить ошибки выше
      log({
        onCatch: data => logging.onRequest(data),
      }),

      (request, next) => next(new Request(request, { signal: abortController.signal })),

      cookie(cookieStore),

      defaultHeaders(getForwardedHeaders(config, context.request)),

      // @todo metrics, tracing

      // ВАЖНО: слой логирования запроса и ответа ПОСЛЕ остальных слоев чтобы использовать актуальные данные
      log({
        onRequest: data => logging.onRequest(data),
        onResponse: data => logging.onResponse(data),
      }),
    ];
  },
} as const;
