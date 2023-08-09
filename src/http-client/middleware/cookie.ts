import type { Middleware } from 'middleware-axios';
import type { CookieStore } from '../../http';

/**
 * Возвращает новый middleware для работы с cookie на сервере.
 * @param store Хранилище.
 * @return Middleware.
 */
export function cookieMiddleware(store: CookieStore): Middleware<any> {
  return async (config, next) => {
    const result = await next({
      ...config,
      headers: {
        ...config.headers,

        // @todo учитывать Domain, Path, Expires и тд
        // @todo учитывать редиректы с куками
        Cookie: store.getCookies(),
      },
    });

    if (result.headers['set-cookie']) {
      result.headers['set-cookie'].forEach(item => store.setCookie(item));
    }
  };
}
