/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import type { PageTemplate } from '../../http-server/types';
import type { Handler } from 'express';
import { Application, Preset, Resolve, CURRENT_APP, createPreset } from '../../di';
import { KnownToken } from '../../tokens';
import { renderToString } from 'react-dom/server';
import { RESPONSE_EVENT } from '../../http-server/constants';
import { pageTemplate } from '../../http-server/template';
import { getRequestHeaders, PageResponse } from '../../http-server/utils';
import { createSagaMiddleware, SagaExtendedMiddleware } from '../../utils/redux-saga';
import { HttpClientFactory } from '../../http-client/types';
import { create } from 'middleware-axios';
import { tracingMiddleware } from '../../http-client/middleware/tracing';
import { loggingMiddleware } from '../../http-client/middleware/logging';
import { passHeadersMiddleware } from '../../http-client/middleware/headers';
import { collectCookieMiddleware } from '../../http-client/middleware/cookie';
import { SSRError } from '../../http-server/errors';

/**
 * Возвращает preset с зависимостями по умолчанию для работы в рамках ответа на http-запрос.
 * @return Preset.
 */
export function PresetResponse(): Preset {
  return createPreset([
    [KnownToken.sagaMiddleware, provideSagaMiddleware],
    [KnownToken.Response.render, provideRender],
    [KnownToken.Response.template, provideTemplate],
    [KnownToken.Response.main, provideMain],
    [KnownToken.Response.params, provideParams],
    [KnownToken.Http.Client.factory, provideHttpClientFactory],
  ]);
}

export function provideHttpClientFactory(resolve: Resolve): HttpClientFactory {
  const appConfig = resolve(KnownToken.Config.base);
  const logger = resolve(KnownToken.logger);
  const tracer = resolve(KnownToken.Tracing.tracer);
  const context = resolve(KnownToken.Response.context);

  return function createHttpClient(config) {
    const client = create({
      ...config,
      headers: {
        ...getRequestHeaders(appConfig, context.req),
        ...config.headers,
      },
    });

    client.use(tracingMiddleware(tracer, context.res.locals.tracing.rootContext));
    client.use(loggingMiddleware(logger));
    client.use(
      passHeadersMiddleware(context.req, {
        predicate: headerName => headerName.startsWith('simaland-'),
      }),
    );
    client.use(collectCookieMiddleware(context.req, context.res));

    return client;
  };
}

export function provideSagaMiddleware(resolve: Resolve): SagaExtendedMiddleware {
  const logger = resolve(KnownToken.logger);

  return createSagaMiddleware(logger);
}

export function provideRender(resolve: Resolve): (element: JSX.Element) => string {
  const { res } = resolve(KnownToken.Response.context);

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
  const context = resolve(KnownToken.Response.context);
  const assets = resolve(KnownToken.Response.assets);
  const prepare = resolve(KnownToken.Response.prepare);
  const render = resolve(KnownToken.Response.render);
  const template = resolve(KnownToken.Response.template);
  const logger = resolve(KnownToken.logger);

  return async function main() {
    try {
      new PageResponse()
        .markup(await render(await prepare()))
        .assets(assets)
        .format(PageResponse.defineFormat(context.req))
        .template(template)
        .send(context.res);
    } catch (error) {
      let message;
      let statusCode = 500;

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

export function provideParams(resolve: Resolve): Record<string, unknown> {
  const context = resolve(KnownToken.Response.context);

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
 * @param appFactory Фабрика di-приложения запроса.
 * @return Обработчик.
 */
export function HandlerProvider(appFactory: () => Application) {
  return function provider(resolve: Resolve): Handler {
    const parent = resolve(CURRENT_APP);

    return function handler(req, res, next) {
      const app = appFactory();

      app.attach(parent);
      app.bind(KnownToken.Response.context).toValue({ req, res, next });
      app.get(KnownToken.Response.main)();
    };
  };
}
