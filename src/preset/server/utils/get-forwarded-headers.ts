import type { BaseConfig } from '../../../config';
import { getClientIp } from './get-client-ip';

/**
 * Вернет заголовки, которые должны содержаться в исходящих http-запросах при обработке входящего http-запроса.
 * @param config Конфигурация.
 * @param request Входящий запрос.
 * @return Заголовки.
 */
export function getForwardedHeaders(config: BaseConfig, request: Request): Headers {
  const result = new Headers();

  // user agent
  result.set('User-Agent', `simaland-${config.appName}/${config.appVersion}`);

  // client ip
  const clientIp = getClientIp(request);
  if (clientIp) {
    result.set('X-Client-Ip', clientIp);
  }

  // cookie
  const cookie = request.headers.get('cookie');
  if (cookie) {
    result.set('cookie', cookie);
  }

  // service headers
  request.headers.forEach((headerValue, headerName) => {
    if (
      headerName.toLowerCase().startsWith('simaland-') &&
      headerName.toLowerCase() !== 'simaland-params'
    ) {
      result.set(headerName, headerValue);
    }
  });

  return result;
}
