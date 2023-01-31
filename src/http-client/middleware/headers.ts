import type { Request } from 'express';
import type { Middleware } from 'middleware-axios';
import type { RawAxiosRequestHeaders } from 'axios';

export interface PassHeadersOptions {
  predicate: (headerName: string, headerValue: string) => boolean;
}

/**
 * Возвращает новый промежуточный слой для проброса заголовков входящего запроса во все исходящие запросы.
 * Принудительно игнорирует заголовок Cookie.
 * @param req Request.
 * @param options Опции.
 * @return Промежуточный слой.
 */
export function passHeadersMiddleware(
  req: Request,
  { predicate }: PassHeadersOptions = { predicate: () => true },
): Middleware<any> {
  return async function passHeaders(config, next) {
    const headers: RawAxiosRequestHeaders = { ...config.headers };

    for (const headerName in req.headers) {
      const headerValue = req.headers[headerName];

      if (typeof headerValue === 'string' && predicate(headerName, headerValue)) {
        headers[headerName] = headerValue;
      }
    }

    await next({ ...config, headers });
  };
}
