import type { Request, Response } from 'express';
import type { Middleware } from 'middleware-axios';

export interface CookieStore {
  set: (seCookie: string[]) => void;
  asHeader: () => string;
}

/**
 * Возвращает новый middleware для работы с cookie на сервере.
 * @param request Входящий запрос.
 * @param response Исходящий ответ.
 * @return Middleware.
 */
export function collectCookieMiddleware(request: Request, response: Response): Middleware<any> {
  const store = createCookieStore(request.get('cookie'));

  return async function collectCookie(config, next) {
    const result = await next({
      ...config,
      headers: {
        ...config.headers,
        Cookie: store.asHeader(),
      },
    });

    if (result.headers['set-cookie']) {
      store.set(result.headers['set-cookie']);
      response.setHeader('cookie', store.asHeader());
    }
  };
}

/**
 * Возвращает новое хранилище cookie.
 * @internal
 * @param initialCookie Начальное значение cookie.
 * @return Хранилище cookie.
 */
export function createCookieStore(initialCookie?: string): CookieStore {
  const data: Record<string, { name: string; value: string }> = {};

  // eslint-disable-next-line require-jsdoc, jsdoc/require-jsdoc
  function setItem(cookieItem: string) {
    const [cookieName, cookieValue] = cookieItem.split('=').map(item => item.trim());

    if (cookieName && cookieValue) {
      data[cookieName] = { name: cookieName, value: cookieValue };
    }
  }

  if (initialCookie && initialCookie.length) {
    for (const item of initialCookie.split(';')) {
      setItem(item);
    }
  }

  // eslint-disable-next-line require-jsdoc, jsdoc/require-jsdoc
  function set(setCookieHeaderValues: string[]): void {
    for (const item of setCookieHeaderValues) {
      // отделяем значение от директив
      const [cookie] = item.split(';');
      setItem(cookie);
    }
  }

  // eslint-disable-next-line require-jsdoc, jsdoc/require-jsdoc
  function asHeader(): string {
    return Object.values(data)
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');
  }

  return { set, asHeader };
}
