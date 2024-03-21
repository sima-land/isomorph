import type { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { EmitterAsTarget } from '../../node/utils/emitter-as-target';

/**
 * Провайдер объекта событий ответа.
 * @param resolve Resolve.
 * @return Объект событий.
 */
export function provideResponseEvents(resolve: Resolve): EventTarget {
  const context = resolve(KnownToken.ExpressHandler.context);

  return new EmitterAsTarget(context.res);
}
