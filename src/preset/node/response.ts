import type { ResponseContext, ConventionalJson } from '../../http-server/types';
import type { Container } from '../../container/types';
import { createSagaRunner } from '../../saga-runner';
import { KnownToken } from '../../tokens';
import { renderToString } from 'react-dom/server';
import { RESPONSE_EVENT } from '../../http-server/constants';

/**
 * Наполняет переданный контейнер зависимостями по умолчанию для работы в рамках ответа на http-запрос.
 * @param context Контекст ответа на http-запрос.
 * @param container Контейнер.
 */
export function presetResponse(context: ResponseContext, container: Container): void {
  container.set(KnownToken.Response.context, () => context);

  container.set(KnownToken.Response.sagaRunner, resolve => {
    const logger = resolve(KnownToken.logger);
    return createSagaRunner(logger);
  });

  container.set(KnownToken.Response.render, resolve => {
    const { res } = resolve(KnownToken.Response.context);

    return function render(element: JSX.Element): string {
      res.emit(RESPONSE_EVENT.renderStart);

      const result = renderToString(element);

      res.emit(RESPONSE_EVENT.renderFinish);

      return result;
    };
  });

  container.set(KnownToken.Response.send, resolve => {
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
        res.send(markup);
      }
    };
  });

  container.set(KnownToken.Response.main, resolve => {
    const prepare = resolve(KnownToken.Response.prepare);
    const render = resolve(KnownToken.Response.render);
    const send = resolve(KnownToken.Response.send);

    return async function main() {
      const element = await prepare();
      const markup = await render(element);
      send(markup);
    };
  });
}
