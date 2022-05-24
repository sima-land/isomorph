/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import type { SagaRunner } from '../../saga-runner/types';
import type { PageTemplate } from '../../http-server/types';
import type { Handler } from 'express';
import { Application, Preset, Provider, Resolve, CURRENT_APP, createPreset } from '../../di';
import { KnownToken } from '../../tokens';
import { renderToString } from 'react-dom/server';
import { createSagaRunner } from '../../saga-runner';
import { RESPONSE_EVENT } from '../../http-server/constants';
import { pageTemplate } from '../../http-server/template';
import { PageResponse } from '../../http-server/utils';

/**
 * Возвращает preset с зависимостями по умолчанию для работы в рамках ответа на http-запрос.
 * @return Preset.
 */
export function PresetResponse(): Preset {
  return createPreset([
    [KnownToken.Response.sagaRunner, provideSagaRunner],
    [KnownToken.Response.render, provideRender],
    [KnownToken.Response.template, provideTemplate],
    [KnownToken.Response.main, provideMain],
  ]);
}

export const provideSagaRunner: Provider<SagaRunner> = resolve => {
  const logger = resolve(KnownToken.logger);
  return createSagaRunner(logger);
};

export const provideRender: Provider<(el: JSX.Element) => string | Promise<string>> = resolve => {
  const { res } = resolve(KnownToken.Response.context);

  return function render(element: JSX.Element): string {
    res.emit(RESPONSE_EVENT.renderStart);

    const result = renderToString(element);

    res.emit(RESPONSE_EVENT.renderFinish);

    return result;
  };
};

export const provideTemplate: Provider<PageTemplate> = resolve => {
  const config = resolve(KnownToken.Config.base);

  return function template(data) {
    return data.type === 'html'
      ? pageTemplate({ ...data, title: `[dev] ${config.appName}` })
      : data.markup;
  };
};

export const provideMain: Provider<() => void> = resolve => {
  const context = resolve(KnownToken.Response.context);
  const assets = resolve(KnownToken.Response.assets);
  const prepare = resolve(KnownToken.Response.prepare);
  const render = resolve(KnownToken.Response.render);
  const template = resolve(KnownToken.Response.template);

  return async function main() {
    PageResponse.create()
      .markup(await render(await prepare()))
      .script(assets.js)
      .styles(assets.css)
      .format(PageResponse.defineFormat(context.req))
      .template(template)
      .send(context.res);
  };
};

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
