import { createCookieStore } from '../../../http';
import type { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';

/**
 * Провайдер хранилища cookie для исходящих запросов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Хранилище cookie.
 */
export function provideCookieStore(resolve: Resolve) {
  const context = resolve(KnownToken.ExpressHandler.context);

  const store = createCookieStore(context.req.header('cookie'));

  // @todo
  // store.subscribe(setCookieList => {
  //   for (const setCookie of setCookieList) {
  //     const parsed = parseSetCookieHeader(setCookie);

  //     if (!parsed) {
  //       return;
  //     }

  //     context.res.cookie(parsed.name, parsed.value, parsed.attrs);
  //   }
  // });

  return store;
}
