/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import type { PageTemplate } from '../../http-server/types';
import type { Handler } from 'express';
import { Application, Preset, Resolve, CURRENT_APP, createPreset } from '../../di';
import { KnownToken } from '../../tokens';
import { renderToString } from 'react-dom/server';
import { RESPONSE_EVENT } from '../../http-server/constants';
import { pageTemplate } from '../../http-server/template';
import { PageResponse } from '../../http-server/utils';
import { createSagaMiddleware, SagaExtendedMiddleware } from '../../utils/redux-saga';

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
  ]);
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

  return async function main() {
    new PageResponse()
      .markup(await render(await prepare()))
      .assets(assets)
      .format(PageResponse.defineFormat(context.req))
      .template(template)
      .send(context.res);
  };
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
