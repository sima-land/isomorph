import type { Handler, Request } from 'express';
import type { BaseConfig } from '../config/types';
import net from 'node:net';

/**
 * Объединяет промежуточные слои в один.
 * @param list Промежуточные слои.
 * @return Промежуточный слой.
 */
export function composeMiddleware(list: Handler[]) {
  return list.reduce((a, b) => (req, res, next) => {
    a(req, res, err => {
      if (err) {
        return next(err);
      }

      b(req, res, next);
    });
  });
}

/**
 * Определяет IP входящего запроса.
 * @param req Входящий запрос.
 * @return IP.
 */
export function getXClientIp(req: Request): string {
  const headerValue =
    req.get('x-client-ip') || req.get('x-forwarded-for') || req.socket.remoteAddress || '';

  return net.isIP(headerValue) ? headerValue : '';
}

/**
 * Определяет служебные заголовки по соглашению.
 * @param req Входящий запрос.
 * @return Служебные заголовки.
 */
export function getServiceHeaders(req: Request): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};

  for (const [key] of Object.entries(req.headers)) {
    if (key.toLowerCase().indexOf('simaland-') === 0) {
      result[key] = req.header(key);
    }
  }

  return result;
}

/**
 * Формирует заголовки для исходящих запросов с сервера по соглашению.
 * @todo Убрать в preset'ы?
 * @param config Конфиг.
 * @param request Входящий запрос.
 * @return Заголовки для исходящих запросов.
 */
export function getRequestHeaders(config: BaseConfig, request: Request): Record<string, string> {
  return {
    'X-Client-Ip': getXClientIp(request),
    'User-Agent': `simaland-${config.appName}/${config.appVersion}`,
    Cookie: request.get('cookie') || '',
    ...getServiceHeaders(request),
  };
}
