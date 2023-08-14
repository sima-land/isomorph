import { ResponseError, createCookieStore } from '../../../../http';
import { Resolve } from '../../../../di';
import { KnownToken } from '../../../../tokens';
import { getRequestHeaders, tracingMiddleware } from '../../node/utils/http-client';
import { CreateAxiosDefaults } from 'axios';
import { create } from 'middleware-axios';
import { HttpStatus } from '../../../isomorphic/utils';
import { cookieMiddleware, logMiddleware } from '../../../../utils/axios';
import { RESPONSE_EVENT_TYPE } from '../../../isomorphic/constants';
import { ConventionalJson } from '../../../isomorphic/types';
import { Fragment } from 'react';
import { HelmetContext, RegularHelmet, getResponseFormat } from '../utils';
import { renderToString } from 'react-dom/server';

/**
 * Провайдер фабрики http-клиентов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Фабрика.
 */
export function provideHttpClientFactory(resolve: Resolve) {
  // @todo а что если привести все зависимости к виду:
  // const getAppConfig = resolve.lazy(KnownToken.Config.base);

  const appConfig = resolve(KnownToken.Config.base);
  const tracer = resolve(KnownToken.Tracing.tracer);
  const context = resolve(KnownToken.Http.Handler.context);
  const logHandler = resolve(KnownToken.Http.Client.Middleware.Log.handler);

  // @todo добавить при необходимости (но тогда в логе будет значительно больше ошибок)
  // можно не отсылать ошибки из клиента если ответ от сервера уже ушел (writableEnded)
  // const controller = new AbortController();
  // context.res.on('finish', () => {
  //   controller.abort();
  // });

  // ВАЖНО: для всех клиентов в рамках обработчика должно быть одно хранилище cookie
  const cookieStore = createCookieStore(context.req.header('cookie'));

  cookieStore.subscribe(() => {
    if (!context.res.writableEnded) {
      context.res.setHeader('cookie', cookieStore.getCookies());
    }
  });

  const defaultHeaders = getRequestHeaders(appConfig, context.req);

  return (config: CreateAxiosDefaults = {}) => {
    const client = create({
      ...config,
      headers: {
        ...defaultHeaders,

        // @todo убрать as any
        ...(config.headers as any),
      },
    });

    client.use(HttpStatus.axiosMiddleware());
    client.use(tracingMiddleware(tracer, context.res.locals.tracing.rootContext));
    client.use(logMiddleware(logHandler));
    client.use(cookieMiddleware(cookieStore));

    return client;
  };
}

/**
 * Провайдер главной функции обработчика входящего http-запроса.
 * @param resolve Функция для получения зависимости по токену.
 * @return Главная функция.
 */
export function provideHandlerMain(resolve: Resolve): VoidFunction {
  const config = resolve(KnownToken.Config.base);
  const logger = resolve(KnownToken.logger);
  const assetsInit = resolve(KnownToken.Http.Handler.Page.assets);
  const render = resolve(KnownToken.Http.Handler.Page.render);
  const extras = resolve(KnownToken.Http.Handler.Response.specificExtras);
  const Helmet = resolve(KnownToken.Http.Handler.Page.helmet);
  const { req, res } = resolve(KnownToken.Http.Handler.context);

  const getAssets = typeof assetsInit === 'function' ? assetsInit : () => assetsInit;

  /**
   * Рендер JSX-элемента в строку.
   * @param element Элемент.
   * @return Строка.
   */
  const elementToString = (element: JSX.Element) => {
    res.emit(RESPONSE_EVENT_TYPE.renderStart);
    const result = renderToString(element);
    res.emit(RESPONSE_EVENT_TYPE.renderFinish);

    return result;
  };

  return async function main() {
    try {
      const assets = await getAssets();
      const meta = extras.getMeta();

      const jsx = (
        <HelmetContext.Provider value={{ title: config.appName, assets }}>
          <Helmet>{await render()}</Helmet>
        </HelmetContext.Provider>
      );

      switch (getResponseFormat(req)) {
        case 'html': {
          res.setHeader('simaland-bundle-js', assets.js);
          res.setHeader('simaland-bundle-css', assets.css);

          if (assets.criticalJs) {
            res.setHeader('simaland-critical-js', assets.criticalJs);
          }

          if (assets.criticalCss) {
            res.setHeader('simaland-critical-css', assets.criticalCss);
          }

          if (meta) {
            res.setHeader('simaland-meta', JSON.stringify(meta));
          }

          // ВАЖНО: DOCTYPE обязательно нужен так как влияет на то как браузер будет парсить html/css
          // ВАЖНО: DOCTYPE нужен только когда отдаем полноценную страницу
          if (config.env === 'development') {
            res.send(`<!DOCTYPE html>${elementToString(jsx)}`);
          } else {
            res.send(elementToString(jsx));
          }
          break;
        }

        case 'json': {
          res.json(
            JSON.stringify({
              markup: elementToString(jsx),
              bundle_js: assets.js,
              bundle_css: assets.css,
              critical_js: assets.criticalJs,
              critical_css: assets.criticalCss,
              meta,
            } satisfies ConventionalJson),
          );
          break;
        }
      }
    } catch (error) {
      let message;
      let statusCode = 500; // по умолчанию, если на этапе подготовки страницы что-то не так, отдаем 500

      if (error instanceof Error) {
        message = error.message;

        if (error instanceof ResponseError) {
          statusCode = error.statusCode;
        }
      } else {
        message = String(error);
      }

      res.status(statusCode).send(message);
      logger.error(error);
    }
  };
}

/**
 * Провайдер render-функции.
 * @return Render-Функция.
 */
export function providePageRender() {
  return () => (
    <>
      <h1>Hello, world!</h1>
      <p>This is a stub page. Define the render component in your handler</p>
    </>
  );
}

/**
 * Провайдер helmet-компонента. Этот компонент является контейнером для результата render-функции.
 * @param resolve Функция для получения зависимости по токену.
 * @return Helmet-компонент.
 */
export function providePageHelmet(resolve: Resolve) {
  const config = resolve(KnownToken.Config.base);
  const { req } = resolve(KnownToken.Http.Handler.context);

  return config.env === 'development' && getResponseFormat(req) === 'html'
    ? RegularHelmet
    : Fragment;
}

/**
 * Провайдер специфичных параметров, которые frontend-микросервис будет получать в запросе.
 * @param resolve Функция для получения зависимости по токену.
 * @return Параметры.
 */
export function provideSpecificParams(resolve: Resolve): Record<string, unknown> {
  const context = resolve(KnownToken.Http.Handler.context);

  try {
    const headerValue = context.req.header('simaland-params');

    /**
     * Node.js переводит в ASCII.
     * @see {https://github.com/nodejs/node/issues/17390}
     */
    const processedValue = headerValue ? Buffer.from(headerValue, 'binary').toString('utf8') : '';

    return processedValue ? JSON.parse(processedValue) : {};
  } catch {
    return {};
  }
}
