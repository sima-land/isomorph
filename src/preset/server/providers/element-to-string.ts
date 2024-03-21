import type { Resolve } from '../../../di';
import type { JSX } from 'react';
import { KnownToken } from '../../../tokens';
import { renderToString } from 'react-dom/server';
import { PAGE_HANDLER_EVENT_TYPE } from '../constants';

/**
 * Провайдера функции рендера элемента в строку.
 * @param resolve Resolve.
 * @return Функция рендера.
 */
export function provideElementToString(resolve: Resolve): (jsx: JSX.Element) => string {
  const events = resolve(KnownToken.Http.Handler.Response.events);

  return jsx => {
    events.dispatchEvent(new Event(PAGE_HANDLER_EVENT_TYPE.renderStart));
    const result = renderToString(jsx);
    events.dispatchEvent(new Event(PAGE_HANDLER_EVENT_TYPE.renderFinish));

    return result;
  };
}
