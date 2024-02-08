import {
  Middleware,
  ResponseError,
  cookie,
  createCookieStore,
  defaultHeaders,
  log,
} from '../../../../http';
import { Resolve } from '../../../../di';
import { KnownToken } from '../../../../tokens';
import {
  getForwardedHeaders as getForwardedHeadersExpress,
  tracingMiddleware as tracingMiddlewareAxios,
} from '../../node/utils/http-client';
import { CreateAxiosDefaults } from 'axios';
import { create } from 'middleware-axios';
import { FetchLogging, HttpStatus } from '../../../isomorphic/utils';
import { cookieMiddleware, logMiddleware } from '../../../../utils/axios';
import { RESPONSE_EVENT_TYPE } from '../../../isomorphic/constants';
import { ConventionalJson } from '../../../isomorphic/types';
import { Fragment } from 'react';
import { HelmetContext, RegularHelmet, getPageResponseFormat } from '../utils';
import { renderToString } from 'react-dom/server';
import { tracingMiddleware } from '../../../server/utils';

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
    } finally {
      abortController.abort();
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
  const logger = resolve(KnownToken.logger);
  const tracer = resolve(KnownToken.Tracing.tracer);
  const context = resolve(KnownToken.ExpressHandler.context);
  const cookieStore = resolve(KnownToken.Http.Fetch.cookieStore);
  const abortController = resolve(KnownToken.Http.Fetch.abortController);

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
      onCatch: data => logging.onCatch(data),
    }),

    (request, next) => {
      const innerController = new AbortController();

      abortController.signal.addEventListener('abort', () => {
        innerController.abort();
      });

      request.signal?.addEventListener('abort', () => {
        innerController.abort();
      });

      return next(new Request(request, { signal: innerController.signal }));
    },

    cookie(cookieStore),

    defaultHeaders(getForwardedHeadersExpress(config, context.req)),

    tracingMiddleware(tracer, context.res.locals.tracing.rootContext),

    // ВАЖНО: слой логирования запроса и ответа ПОСЛЕ остальных слоев чтобы использовать актуальные данные
    log({
      onRequest: data => logging.onRequest(data),
      onResponse: data => logging.onResponse(data),
    }),
  ];
}

/**
 * Провайдер фабрики http-клиентов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Фабрика.
 */
export function provideAxiosFactory(resolve: Resolve) {
  // @todo а что если привести все зависимости к виду:
  // const getAppConfig = resolve.lazy(KnownToken.Config.base);

  const appConfig = resolve(KnownToken.Config.base);
  const tracer = resolve(KnownToken.Tracing.tracer);
  const context = resolve(KnownToken.ExpressHandler.context);
  const logHandler = resolve(KnownToken.Axios.Middleware.Log.handler);
  const abortController = resolve(KnownToken.Http.Fetch.abortController);
  const cookieStore = resolve(KnownToken.Http.Fetch.cookieStore);

  // @todo добавить при необходимости (но тогда в логе будет значительно больше ошибок)
  // можно не отсылать ошибки из клиента если ответ от сервера уже ушел (writableEnded)
  // const controller = new AbortController();
  // context.res.on('finish', () => {
  //   controller.abort();
  // });

  // @todo унести в провайдер стора кук
  // cookieStore.subscribe(() => {
  //   if (!context.res.writableEnded) {
  //     context.res.setHeader('set-cookie', cookieStore.getCookies());
  //   }
  // });

  return (config: CreateAxiosDefaults = {}) => {
    const client = create({
      ...config,
      headers: {
        ...getForwardedHeadersExpress(appConfig, context.req),

        // @todo убрать as any
        ...(config.headers as any),
      },
    });

    // @todo объединить сигналы из аргумента request и из провайдера
    client.use(async (requestConfig, next) => {
      const innerController = new AbortController();

      abortController.signal.addEventListener('abort', () => {
        innerController.abort();
      });

      requestConfig.signal?.addEventListener?.('abort', () => {
        innerController.abort();
      });

      next({ ...requestConfig, signal: innerController.signal });
    });

    client.use(HttpStatus.axiosMiddleware());
    client.use(tracingMiddlewareAxios(tracer, context.res.locals.tracing.rootContext));
    client.use(logMiddleware(logHandler));
    client.use(cookieMiddleware(cookieStore));

    return client;
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
