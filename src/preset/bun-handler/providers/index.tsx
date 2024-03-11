/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { renderToString } from 'react-dom/server';
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import {
  CookieStore,
  Middleware,
  ResponseError,
  applyMiddleware,
  cookie,
  createCookieStore,
  defaultHeaders,
  LogHandler,
  LogHandlerFactory,
} from '../../../http';
import { Fragment } from 'react';
import { getFetchErrorLogging } from '../../isomorphic/utils/get-fetch-error-logging';
import { getFetchExtraAborting } from '../../isomorphic/utils/get-fetch-extra-aborting';
import { getFetchLogging } from '../../isomorphic/utils/get-fetch-logging';
import { FetchLogging } from '../../isomorphic/utils/fetch-logging';
import { PageAssets } from '../../isomorphic/types';
import { PAGE_HANDLER_EVENT_TYPE } from '../../server/constants';
import { HelmetContext, RegularHelmet } from '../../server/utils/regular-helmet';
import { getPageResponseFormat } from '../../server/utils/get-page-response-format';
import { getForwardedHeaders } from '../../server/utils/get-forwarded-headers';

export const HandlerProviders = {
  handlerMain(resolve: Resolve) {
    const config = resolve(KnownToken.Config.base);
    const logger = resolve(KnownToken.logger);
    const assetsInit = resolve(KnownToken.Http.Handler.Page.assets);
    const render = resolve(KnownToken.Http.Handler.Page.render);
    const extras = resolve(KnownToken.Http.Handler.Response.specificExtras);
    const Helmet = resolve(KnownToken.Http.Handler.Page.helmet);
    const abortController = resolve(KnownToken.Http.Fetch.abortController);
    const context = resolve(KnownToken.Http.Handler.context);

    const getAssets = typeof assetsInit === 'function' ? assetsInit : () => assetsInit;

    const elementToString = (element: JSX.Element) => {
      context.events.dispatchEvent(new Event(PAGE_HANDLER_EVENT_TYPE.renderStart));
      const result = renderToString(element);
      context.events.dispatchEvent(new Event(PAGE_HANDLER_EVENT_TYPE.renderFinish));

      return result;
    };

    const getResponseHTML = (jsx: React.JSX.Element, assets: PageAssets, meta: unknown) => {
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
    };

    const getResponseJSON = (jsx: React.JSX.Element, assets: PageAssets, meta: unknown) => {
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

        switch (getPageResponseFormat(request)) {
          case 'html': {
            return getResponseHTML(jsx, assets, meta);
          }
          case 'json': {
            return getResponseJSON(jsx, assets, meta);
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
      // ВАЖНО: прерываем исходящие в рамках обработчика http-запросы
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

    return config.env === 'development' && getPageResponseFormat(request) === 'html'
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

  fetchMiddleware(resolve: Resolve): Middleware[] {
    const config = resolve(KnownToken.Config.base);
    const context = resolve(KnownToken.Http.Handler.context);
    const logHandler = resolve(KnownToken.Http.Fetch.Middleware.Log.handler);
    const cookieStore = resolve(KnownToken.Http.Fetch.cookieStore);
    const abortController = resolve(KnownToken.Http.Fetch.abortController);

    return [
      // ВАЖНО: слой логирования ошибки ПЕРЕД остальными слоями чтобы не упустить ошибки выше
      getFetchErrorLogging(logHandler),

      // обрывание по сигналу из обработчика входящего запроса и по сигналу из конфига исходящего запроса
      getFetchExtraAborting(abortController),

      cookie(cookieStore),

      defaultHeaders(getForwardedHeaders(config, context.request)),

      // @todo metrics, tracing

      // ВАЖНО: слой логирования запроса и ответа ПОСЛЕ остальных слоев чтобы использовать актуальные данные
      getFetchLogging(logHandler),
    ];
  },

  /**
   * Провайдер обработчика логирования axios.
   * @param resolve Функция для получения зависимости по токену.
   * @return Обработчик логирования.
   */
  fetchLogHandler(resolve: Resolve): LogHandler | LogHandlerFactory {
    const logger = resolve(KnownToken.logger);
    const abortController = resolve(KnownToken.Http.Fetch.abortController);

    const logHandler = new FetchLogging(logger);

    // ВАЖНО: отключаем логирование если запрос прерван
    logHandler.disabled = () => abortController.signal.aborted;

    return logHandler;
  },

  cookieStore(resolve: Resolve): CookieStore {
    const context = resolve(KnownToken.Http.Handler.context);

    return createCookieStore(context.request.headers.get('cookie') ?? undefined);
  },
} as const;
