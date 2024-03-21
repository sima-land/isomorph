import type { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import accepts from 'accepts';

/**
 * Провайдер функции, которая определяет возможные типы ответа и их приоритет.
 * @param resolve Resolve.
 * @return Функция.
 */
export function provideAcceptType(resolve: Resolve) {
  const context = resolve(KnownToken.Http.Handler.context);

  // @todo опасное место, будем решать как исправлять по итогам https://github.com/jshttp/accepts/issues/30
  const accept = accepts({
    headers: Object.fromEntries(context.request.headers.entries()),
  } as any);

  return accept.type.bind(accept);
}
