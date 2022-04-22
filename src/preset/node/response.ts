import type { ResponseContext, ConventionalJson } from '../../http-server/types';
import type { Preset } from '../types';
import { KnownToken } from '../../tokens';
import { renderToString } from 'react-dom/server';
import { createSagaRunner } from '../../saga-runner';
import { RESPONSE_EVENT } from '../../http-server/constants';
import { createPreset } from '..';

/**
 * Возвращает preset с зависимостями по умолчанию для работы в рамках ответа на http-запрос.
 * @param context Контекст ответа на http-запрос.
 * @return Preset.
 */
export function PresetResponse(context: ResponseContext): Preset {
  return createPreset([
    [KnownToken.Response.context, () => context],

    [
      KnownToken.Response.sagaRunner,
      resolve => {
        const logger = resolve(KnownToken.logger);
        return createSagaRunner(logger);
      },
    ],

    [
      KnownToken.Response.render,
      resolve => {
        const { res } = resolve(KnownToken.Response.context);

        return function render(element: JSX.Element): string {
          res.emit(RESPONSE_EVENT.renderStart);

          const result = renderToString(element);

          res.emit(RESPONSE_EVENT.renderFinish);

          return result;
        };
      },
    ],

    [
      KnownToken.Response.send,
      resolve => {
        const { req, res } = resolve(KnownToken.Response.context);

        return function send(markup: string) {
          if ((req.header('accept') || '').toLowerCase().includes('application/json')) {
            const result: ConventionalJson = {
              markup,

              // @todo доделать
              bundle_js: '',
              bundle_css: '',
            };
            res.json(result);
          } else {
            // по умолчанию отправляем HTML
            res.send(markup);
          }
        };
      },
    ],

    [
      KnownToken.Response.main,
      resolve => {
        const prepare = resolve(KnownToken.Response.prepare);
        const render = resolve(KnownToken.Response.render);
        const send = resolve(KnownToken.Response.send);

        return async function main() {
          const element = await prepare();
          const markup = await render(element);

          send(markup);
        };
      },
    ],
  ]);
}
