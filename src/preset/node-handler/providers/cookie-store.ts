import type { Resolve } from '../../../di';
import { CookieStore, createCookieStore } from '../../../http';
import { KnownToken } from '../../../tokens';

/**
 * Провайдер хранилища cookie для исходящих запросов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Хранилище cookie.
 */
export function provideCookieStore(resolve: Resolve): CookieStore {
  const context = resolve(KnownToken.ExpressHandler.context);

  return createCookieStore(context.req.header('cookie'));
}
