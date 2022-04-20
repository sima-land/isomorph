import { isIP } from 'net';
import type { Request } from 'express';

/**
 * Определяет IP входящего запроса.
 * @param req Входящий запрос.
 * @return IP.
 */
export function getXClientIp(req: Request): string {
  const headerValue =
    req.get('x-client-ip') || req.get('x-forwarded-for') || req.socket.remoteAddress || '';

  return isIP(headerValue) ? headerValue : '';
}

/**
 * Определяет служебные заголовки по соглашению.
 * @param req Входящий запрос.
 * @return Служебные заголовки.
 */
export function getServiceHeaders(req: Request): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};

  Object.entries(req.headers).forEach(([key]) => {
    if (key.toLowerCase().indexOf('simaland-') === 0) {
      result[key] = req.header(key);
    }
  });

  return result;
}
