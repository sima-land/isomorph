import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { applyMiddleware, configureFetch } from '../../../http';

/**
 * Провайдер функции fetch.
 * @param resolve Функция для получения зависимости по токену.
 * @return Функция fetch.
 */
export function provideFetch(resolve: Resolve) {
  const middleware = resolve(KnownToken.Http.Fetch.middleware);

  return configureFetch(fetch, applyMiddleware(...middleware));
}
