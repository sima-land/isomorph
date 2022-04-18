import type { Request, Response } from 'express';
import type { Middleware } from 'middleware-axios';

export interface CookieStore {
  set: (seCookie: string[]) => void;
  asHeader: () => string;
}

export function collectCookieMiddleware(request: Request, response: Response): Middleware<any> {
  const store = createCookieStore(request.get('cookie'));

  return async function (config, next) {
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

export function createCookieStore(initialCookie?: string): CookieStore {
  const data: Record<string, { name: string; value: string }> = {};

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

  function set(setCookieHeaderValues: string[]): void {
    for (const item of setCookieHeaderValues) {
      const [cookie] = item.split(';');
      setItem(cookie);
    }
  }

  function asHeader(): string {
    return Object.values(data)
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join(';');
  }

  return { set, asHeader };
}
