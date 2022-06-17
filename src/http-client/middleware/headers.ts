import type { Request } from 'express';
import type { Middleware } from 'middleware-axios';

/**
 * Возвращает новый промежуточный слой для проброса заголовков входящего запроса во все исходящие запросы.
 * @param req Request.
 * @return Промежуточный слой.
 */
export function passHeadersMiddleware(req: Request): Middleware<any> {
  return async function passHeaders(config, next) {
    const headers: Record<string, string> = { ...config.headers };

    for (const headerName in req.headers) {
      const headerValue = req.headers[headerName];

      if (typeof headerValue === 'string') {
        headers[headerName] = headerValue;
      }
    }

    await next({ ...config, headers });
  };
}
