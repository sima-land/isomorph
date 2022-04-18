import { getServiceHeaders, getXClientIp } from '../http-server/utils';
import type { Request } from 'express';
import type { BaseConfig } from '../config/types';

export function getRequestHeaders(config: BaseConfig, request: Request): Record<string, string> {
  return {
    'X-Client-Ip': getXClientIp(request),
    'User-Agent': `simaland-${config.appName}/${config.appVersion}`,
    Cookie: request.get('cookie') || '',
    ...getServiceHeaders(request),
  };
}
