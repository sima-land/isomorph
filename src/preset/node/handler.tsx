/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import type { Handler, Request } from 'express';
import { Application, Preset, Resolve, CURRENT_APP, createPreset } from '../../di';
import { KnownToken } from '../../tokens';
import { renderToString } from 'react-dom/server';
import { RESPONSE_EVENT_TYPE } from '../parts/constants';
import { HttpClientFactory } from '../../http-client/types';
import { create } from 'middleware-axios';
import { tracingMiddleware } from '../../http-client/middleware/tracing';
import { logMiddleware } from '../../http-client/middleware/log';
import { passHeadersMiddleware } from '../../http-client/middleware/headers';
import { collectCookieMiddleware } from '../../http-client/middleware/cookie';
import { ResponseError } from '../../http';
import { provideSagaMiddleware, provideHttpClientLogHandler } from '../parts/providers';
import { HttpStatus, getRequestHeaders } from '../parts/utils';
import { ConventionalJson, PageAssets, PresetTuner } from '../parts/types';
import { createContext, Fragment, ReactNode, useContext } from 'react';

/**
 * Возвращает preset с зависимостями по умолчанию для работы в рамках ответа на http-запрос.
 * @param customize Получит функцию с помощью которой можно переопределить предустановленные провайдеры.
 * @todo Возможно стоит переименовать в PresetPageHandler.
 * @return Preset.
 */
export function PresetHandler(customize?: PresetTuner): Preset {
  // ВАЖНО: используем .set() вместо аргумента defaults функции createPreset из-за скорости
  const preset = createPreset();

  // saga
  preset.set(KnownToken.sagaMiddleware, provideSagaMiddleware);

  // http client
  preset.set(KnownToken.Http.Client.factory, provideHttpClientFactory);
  preset.set(KnownToken.Http.Client.Middleware.Log.handler, provideHttpClientLogHandler);

  // http handler
  preset.set(KnownToken.Http.Handler.main, provideMain);
  preset.set(KnownToken.Http.Handler.Request.specificParams, provideSpecificParams);
  preset.set(KnownToken.Http.Handler.Response.specificExtras, () => new SpecificExtras());
  preset.set(KnownToken.Http.Handler.Page.assets, () => ({ js: '', css: '' }));
  preset.set(KnownToken.Http.Handler.Page.helmet, providePageHelmet);
  preset.set(KnownToken.Http.Handler.Page.render, providePageRender);

  if (customize) {
    customize({ override: preset.set.bind(preset) });
  }

  return preset;
}

export function provideHttpClientFactory(resolve: Resolve): HttpClientFactory {
  // @todo а что если привести все зависимости к виду:
  // const getAppConfig = resolve.lazy(KnownToken.Config.base);

  const appConfig = resolve(KnownToken.Config.base);
  const tracer = resolve(KnownToken.Tracing.tracer);
  const context = resolve(KnownToken.Http.Handler.context);
  const logHandler = resolve(KnownToken.Http.Client.Middleware.Log.handler);

  // @todo добавить при необходимости (но тогда в логе будет значительно больше ошибок)
  // const controller = new AbortController();
  // context.res.on('finish', () => {
  //   controller.abort();
  // });

  return function createHttpClient(config = {}) {
    const client = create({
      ...config,
      headers: {
        ...getRequestHeaders(appConfig, context.req),
        ...config.headers,
      },
    });

    client.use(HttpStatus.axiosMiddleware());
    client.use(tracingMiddleware(tracer, context.res.locals.tracing.rootContext));
    client.use(logMiddleware(logHandler));
    client.use(
      passHeadersMiddleware(context.req, {
        predicate: headerName => headerName.startsWith('simaland-'),
      }),
    );
    client.use(collectCookieMiddleware(context.req, context.res));

    return client;
  };
}

export function provideMain(resolve: Resolve): VoidFunction {
  const config = resolve(KnownToken.Config.base);
  const logger = resolve(KnownToken.logger);
  const assetsInit = resolve(KnownToken.Http.Handler.Page.assets);
  const render = resolve(KnownToken.Http.Handler.Page.render);
  const extras = resolve(KnownToken.Http.Handler.Response.specificExtras);
  const Helmet = resolve(KnownToken.Http.Handler.Page.helmet);
  const { req, res } = resolve(KnownToken.Http.Handler.context);

  const getAssets = typeof assetsInit === 'function' ? assetsInit : () => assetsInit;

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

function providePageRender() {
  return () => (
    <>
      <h1>Hello, world!</h1>
      <p>This is a stub page. Define the render component in your handler</p>
    </>
  );
}

function providePageHelmet(resolve: Resolve) {
  const config = resolve(KnownToken.Config.base);
  const { req } = resolve(KnownToken.Http.Handler.context);

  return config.env === 'development' && getResponseFormat(req) === 'html'
    ? RegularHelmet
    : Fragment;
}

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

/**
 * Возвращает express-handler, создающий дочернее di-приложение при запросе.
 * @param getApp Должна вернуть di-приложения запроса.
 * @return Обработчик.
 */
export function HandlerProvider(getApp: () => Application) {
  return function provider(resolve: Resolve): Handler {
    const parent = resolve(CURRENT_APP);

    return function handler(req, res, next) {
      const app = getApp();

      app.attach(parent);
      app.bind(KnownToken.Http.Handler.context).toValue({ req, res, next });
      app.get(KnownToken.Http.Handler.main)();
    };
  };
}

const HelmetContext = createContext<{ title?: string; assets?: PageAssets }>({});

const resetCSS = `
* {
  box-sizing: border-box;
}
body {
  font-family: -apple-system,BlinkMacSystemFont,'Source Sans Pro',"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,Arial,sans-serif;
  margin: 0;
}
`;

function RegularHelmet({ children }: { children?: ReactNode }) {
  const { title, assets } = useContext(HelmetContext);

  return (
    <html>
      <head>
        <meta charSet='UTF-8' />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>{title ?? 'Document'}</title>
        <link
          href='https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700;1,900&amp;display=swap'
          rel='stylesheet'
        />
        <style dangerouslySetInnerHTML={{ __html: resetCSS }} />

        {assets?.criticalCss && <link rel='stylesheet' href={assets.criticalCss} />}
        {assets?.css && <link rel='stylesheet' href={assets.css} />}
        {assets?.criticalJs && <script src={assets.criticalJs} />}
      </head>
      <body>
        {children}
        {assets?.js && <script src={assets.js} />}
      </body>
    </html>
  );
}

/**
 * Специфичные для наших микросервисов дополнительные данные ответа.
 */
export class SpecificExtras {
  private _meta: any;

  meta(meta: any): this {
    this._meta = meta;
    return this;
  }

  getMeta(): unknown {
    return this._meta;
  }
}

/**
 * Определит формат ответа.
 * @param req Запрос.
 * @return Формат.
 */
function getResponseFormat(req: Request): 'html' | 'json' {
  let result: 'html' | 'json' = 'html';

  if ((req.header('accept') || '').toLowerCase().includes('application/json')) {
    result = 'json';
  }

  return result;
}
