import type { BaseConfig } from '../../../config';
import type express from 'express';
import { getClientIp } from './get-client-ip';

/**
 * Формирует заголовки для исходящих запросов с сервера по соглашению.
 * @param config Конфиг.
 * @param request Входящий запрос.
 * @return Заголовки для исходящих запросов.
 */
export function getForwardedHeaders(
  config: BaseConfig,
  request: express.Request,
): Record<string, string> {
  const result: Record<string, string> = {
    'User-Agent': `simaland-${config.appName}/${config.appVersion}`,
  };

  const clientIp = getClientIp(request);
  if (clientIp) {
    result['X-Client-Ip'] = clientIp;
  }

  const cookie = request.header('cookie');
  if (cookie) {
    result.Cookie = cookie;
  }

  // добавляем специфичные заголовки
  for (const key of Object.keys(request.headers)) {
    const value = request.header(key);

    if (
      key.toLowerCase().startsWith('simaland-') &&
      key.toLowerCase() !== 'simaland-params' &&
      value
    ) {
      result[key] = value;
    }
  }

  return result;
}
