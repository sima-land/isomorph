/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import type { PageTemplate } from '../../http-server/types';
import type { Handler } from 'express';
import { Application, Preset, Resolve, CURRENT_APP, createPreset } from '../../di';
import { KnownToken } from '../../tokens';
import { renderToString } from 'react-dom/server';
import { RESPONSE_EVENT } from '../../http-server/constants';
import { pageTemplate } from '../../http-server/template';
import { getRequestHeaders, PageResponse } from '../../http-server/utils';
import { HttpClientFactory } from '../../http-client/types';
import { create } from 'middleware-axios';
import { tracingMiddleware } from '../../http-client/middleware/tracing';
import { logMiddleware } from '../../http-client/middleware/log';
import { passHeadersMiddleware } from '../../http-client/middleware/headers';
import { collectCookieMiddleware } from '../../http-client/middleware/cookie';
import { SSRError } from '../../http-server/errors';
import { provideSagaMiddleware, provideHttpClientLogHandler } from '../parts/providers';
import { HttpStatus } from '../parts/utils';

/**
 * Возвращает preset с зависимостями по умолчанию для работы в рамках ответа на http-запрос.
 * @todo Возможно стоит переименовать в PresetPageHandler.
 * @return Preset.
 */
export function PresetHandler(): Preset {
  return createPreset([
    // saga
    [KnownToken.sagaMiddleware, provideSagaMiddleware],

    // http client
    [KnownToken.Http.Client.factory, provideHttpClientFactory],
    [KnownToken.Http.Client.Middleware.Log.handler, provideHttpClientLogHandler],

    // http handler
    [KnownToken.Http.Handler.main, provideMain],
    [KnownToken.Http.Handler.Request.specificParams, provideSpecificParams],
    [KnownToken.Http.Handler.Response.builder, () => new PageResponse()],
    [KnownToken.Http.Handler.Response.Page.assets, () => ({ js: '', css: '' })],
    [KnownToken.Http.Handler.Response.Page.template, provideTemplate],
    [KnownToken.Http.Handler.Response.Page.render, provideRender],
  ]);
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

export function provideRender(resolve: Resolve): (element: JSX.Element) => string {
  const { res } = resolve(KnownToken.Http.Handler.context);

  return function render(element: JSX.Element): string {
    res.emit(RESPONSE_EVENT.renderStart);

    const result = renderToString(element);

    res.emit(RESPONSE_EVENT.renderFinish);

    return result;
  };
}

export function provideTemplate(resolve: Resolve): PageTemplate {
  const config = resolve(KnownToken.Config.base);

  return function template(data) {
    return data.type === 'html'
      ? pageTemplate({ ...data, title: `[dev] ${config.appName}` })
      : data.markup;
  };
}

export function provideMain(resolve: Resolve): VoidFunction {
  const logger = resolve(KnownToken.logger);
  const context = resolve(KnownToken.Http.Handler.context);
  const assets = resolve(KnownToken.Http.Handler.Response.Page.assets);
  const prepare = resolve(KnownToken.Http.Handler.Response.Page.prepare);
  const render = resolve(KnownToken.Http.Handler.Response.Page.render);
  const template = resolve(KnownToken.Http.Handler.Response.Page.template);
  const builder = resolve(KnownToken.Http.Handler.Response.builder);

  const getAssets = typeof assets === 'function' ? assets : () => assets;

  return async function main() {
    try {
      // @todo это билдер ответа но в ответе может не быть markup, assets и тд, подумать и переделать
      builder
        .markup(await render(await prepare()))
        .assets(await getAssets())
        .format(PageResponse.defineFormat(context.req))
        .template(template)
        .send(context.res);
    } catch (error) {
      let message;
      let statusCode = 500; // по умолчанию, если на этапе подготовки страницы что-то не так, отдаем 500

      if (error instanceof Error) {
        message = error.message;

        if (error instanceof SSRError) {
          statusCode = error.statusCode;
        }
      } else {
        message = String(error);
      }

      context.res.status(statusCode).send(message);
      logger.error(error);
    }
  };
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
