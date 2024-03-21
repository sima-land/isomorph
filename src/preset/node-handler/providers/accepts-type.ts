import type { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';

/**
 * Провайдер функции, которая определяет возможные типы ответа и их приоритет.
 * @param resolve Resolve.
 * @return Функция.
 */
export function provideAcceptType(resolve: Resolve) {
  const context = resolve(KnownToken.ExpressHandler.context);

  return context.req.accepts.bind(context.req);
}
