/* eslint-disable require-jsdoc */
import type { Preset } from '../types';
import type { Provider } from '../../container/types';
import type { SagaRunner } from '../../saga-runner/types';
import { KnownToken } from '../../tokens';
import { createPreset } from '..';
import { renderToString } from 'react-dom/server';
import { createSagaRunner } from '../../saga-runner';
import { RESPONSE_EVENT } from '../../http-server/constants';
import { PageResponse } from '../../http-server/utils';

/**
 * Возвращает preset с зависимостями по умолчанию для работы в рамках ответа на http-запрос.
 * @return Preset.
 */
export function PresetResponse(): Preset {
  return createPreset([
    [KnownToken.Response.sagaRunner, provideSagaRunner],
    [KnownToken.Response.render, provideRender],
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

export const provideMain: Provider<() => void> = resolve => {
  const context = resolve(KnownToken.Response.context);
  const assets = resolve(KnownToken.Response.assets);
  const prepare = resolve(KnownToken.Response.prepare);
  const render = resolve(KnownToken.Response.render);

  return async function main() {
    PageResponse.create()
      .markup(await render(await prepare()))
      .script(assets.js)
      .style(assets.css)
      .format(PageResponse.defineFormat(context.req))
      .send(context.res);
  };
};
