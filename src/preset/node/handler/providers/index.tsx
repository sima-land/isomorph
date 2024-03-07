import {
  LogHandler,
  LogHandlerFactory,
  Middleware,
  ResponseError,
  cookie,
  createCookieStore,
  defaultHeaders,
} from '../../../../http';
import type { Resolve } from '../../../../di';
import { KnownToken } from '../../../../tokens';
import {
  getForwardedHeaders as getForwardedHeadersExpress,
  axiosTracingMiddleware,
} from '../../node/utils/http-client';
import type { Middleware as AxiosMiddleware } from 'middleware-axios';
import { AxiosLogging } from '../../../isomorphic/utils/axios-logging';
import { FetchLogging } from '../../../isomorphic/utils/fetch-logging';
import { HttpStatus } from '../../../isomorphic/utils/http-status';
import { getFetchLogging } from '../../../isomorphic/utils/get-fetch-logging';
import { getFetchErrorLogging } from '../../../isomorphic/utils/get-fetch-error-logging';
import { getFetchExtraAborting } from '../../../isomorphic/utils/get-fetch-extra-aborting';
import { LogMiddlewareHandlerInit, cookieMiddleware, logMiddleware } from '../../../../utils/axios';
import { RESPONSE_EVENT_TYPE } from '../../../isomorphic/constants';
import type { ConventionalJson } from '../../../isomorphic/types';
import { Fragment } from 'react';
import { HelmetContext, RegularHelmet, getPageResponseFormat } from '../utils';
import { renderToString } from 'react-dom/server';
import { getFetchTracing } from '../../../server/utils/get-fetch-tracing';

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
  const { req, res } = resolve(KnownToken.ExpressHandler.context);
  const abortController = resolve(KnownToken.Http.Fetch.abortController);

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

  return async () => {
    try {
      const assets = await getAssets();
      const meta = extras.getMeta();

      const jsx = (
        <HelmetContext.Provider value={{ title: config.appName, assets }}>
          <Helmet>{await render()}</Helmet>
        </HelmetContext.Provider>
      );

      switch (getPageResponseFormat(req)) {
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
          res.json({
            markup: elementToString(jsx),
            bundle_js: assets.js,
            bundle_css: assets.css,
            critical_js: assets.criticalJs,
            critical_css: assets.criticalCss,
            meta,
          } satisfies ConventionalJson);
          break;
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

      res.status(statusCode).send(message);
      logger.error(error);
    }

    // ВАЖНО: прерываем исходящие в рамках обработчика http-запросы
    abortController.abort();
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
  const { req } = resolve(KnownToken.ExpressHandler.context);

  return config.env === 'development' && getPageResponseFormat(req) === 'html'
    ? RegularHelmet
    : Fragment;
}

/**
 * Провайдер промежуточных слоев для fetch.
 * @param resolve Функция для получения зависимости по токену.
 * @return Массив промежуточных слоев.
 */
export function provideFetchMiddleware(resolve: Resolve): Middleware[] {
  const config = resolve(KnownToken.Config.base);
  const tracer = resolve(KnownToken.Tracing.tracer);
  const context = resolve(KnownToken.ExpressHandler.context);
  const logHandler = resolve(KnownToken.Http.Fetch.Middleware.Log.handler);
  const cookieStore = resolve(KnownToken.Http.Fetch.cookieStore);
  const abortController = resolve(KnownToken.Http.Fetch.abortController);

  return [
    // ВАЖНО: слой логирования ошибки ПЕРЕД остальными слоями чтобы не упустить ошибки выше
    getFetchErrorLogging(logHandler),

    // пробрасываемые заголовки по соглашению
    defaultHeaders(getForwardedHeadersExpress(config, context.req)),

    // обрывание по сигналу из обработчика входящего запроса и по сигналу из конфига исходящего запроса
    getFetchExtraAborting(abortController),

    cookie(cookieStore),

    getFetchTracing(tracer, context.res.locals.tracing.rootContext),

    // ВАЖНО: слой логирования запроса и ответа ПОСЛЕ остальных слоев чтобы использовать актуальные данные
    getFetchLogging(logHandler),
  ];
}

/**
 * Провайдер обработчика логирования axios.
 * @param resolve Функция для получения зависимости по токену.
 * @return Обработчик логирования.
 */
export function provideFetchLogHandler(resolve: Resolve): LogHandler | LogHandlerFactory {
  const logger = resolve(KnownToken.logger);
  const abortController = resolve(KnownToken.Http.Fetch.abortController);

  const logHandler = new FetchLogging(logger);

  // ВАЖНО: отключаем логирование если запрос прерван
  logHandler.disabled = () => abortController.signal.aborted;

  return logHandler;
}

/**
 * Провайдер фабрики http-клиентов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Фабрика.
 */
export function provideAxiosMiddleware(resolve: Resolve): AxiosMiddleware<any>[] {
  const appConfig = resolve(KnownToken.Config.base);
  const tracer = resolve(KnownToken.Tracing.tracer);
  const context = resolve(KnownToken.ExpressHandler.context);
  const logHandler = resolve(KnownToken.Axios.Middleware.Log.handler);
  const cookieStore = resolve(KnownToken.Http.Fetch.cookieStore);
  const abortController = resolve(KnownToken.Http.Fetch.abortController);

  return [
    // пробрасываемые заголовки по соглашению
    async (config, next) => {
      await next({
        ...config,
        headers: {
          ...getForwardedHeadersExpress(appConfig, context.req),

          // ВАЖНО: заголовки из конфига важнее, поэтому идут в конце
          ...config.headers,
        },
      });
    },

    // обрывание по сигналу из обработчика входящего запроса и по сигналу из конфига исходящего запроса
    async (config, next) => {
      const innerController = new AbortController();

      abortController.signal.addEventListener(
        'abort',
        () => {
          innerController.abort();
        },
        { once: true },
      );

      config.signal?.addEventListener?.(
        'abort',
        () => {
          innerController.abort();
        },
        { once: true },
      );

      await next({ ...config, signal: innerController.signal });
    },

    HttpStatus.axiosMiddleware(),
    axiosTracingMiddleware(tracer, context.res.locals.tracing.rootContext),
    logMiddleware(logHandler),
    cookieMiddleware(cookieStore),
  ];
}

/**
 * Провайдер обработчика логирования axios.
 * @param resolve Функция для получения зависимости по токену.
 * @return Обработчик логирования.
 */
export function provideAxiosLogHandler(resolve: Resolve): LogMiddlewareHandlerInit {
  const logger = resolve(KnownToken.logger);
  const abortController = resolve(KnownToken.Http.Fetch.abortController);

  return data => {
    const logHandler = new AxiosLogging(logger, data);

    // ВАЖНО: отключаем логирование если запрос прерван
    logHandler.disabled = () => abortController.signal.aborted;

    return logHandler;
  };
}

/**
 * Провайдер специфичных параметров, которые frontend-микросервис будет получать в запросе.
 * @param resolve Функция для получения зависимости по токену.
 * @return Параметры.
 */
export function provideSpecificParams(resolve: Resolve): Record<string, unknown> {
  const context = resolve(KnownToken.ExpressHandler.context);

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

/**
 * Провайдер хранилища cookie для исходящих запросов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Хранилище cookie.
 */
export function provideCookieStore(resolve: Resolve) {
  const context = resolve(KnownToken.ExpressHandler.context);

  return createCookieStore(context.req.header('cookie'));
}

// @todo а что если привести все зависимости к виду:
// const getAppConfig = resolve.lazy(KnownToken.Config.base);
