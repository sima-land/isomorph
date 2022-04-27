import { getServiceHeaders, getXClientIp } from '../http-server/utils';
import type { Request } from 'express';
import type { BaseConfig } from '../config/types';

/**
 * Формирует заголовки для исходящих запросов с сервера по соглашению.
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
