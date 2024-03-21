import type { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';

/**
 * Провайдер объекта подписки на события и вызова событий ответа.
 * @param resolve Resolve.
 * @return EventTarget.
 */
export function provideResponseEvents(resolve: Resolve): EventTarget {
  const context = resolve(KnownToken.Http.Handler.context);

  return context.events;
}
