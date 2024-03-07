import type { Middleware } from '../../../http';
import type { Logger } from '../../../log';
import { toMilliseconds } from '../../../utils';
import { getClientIp } from './get-client-ip';

/**
 * Возвращает новый промежуточный слой для логирования обработки входящего http-запроса.
 * @param logger Logger.
 * @return Промежуточный слой.
 */
export function getServeLogging(logger: Logger): Middleware {
  return async (request, next) => {
    const start = process.hrtime.bigint();
    const clientIp = getClientIp(request);

    logger.info({
      type: 'http.request[incoming]',
      route: request.url,
      method: request.method,
      remote_ip: clientIp,
    });

    const response = await next(request);

    const finish = process.hrtime.bigint();

    logger.info({
      type: 'http.response[outgoing]',
      route: request.url,
      method: request.method,
      status: response.status,
      remote_ip: clientIp,
      latency: toMilliseconds(finish - start),
    });

    return response;
  };
}
