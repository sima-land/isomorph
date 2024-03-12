import type express from 'express';
import type { Resolve } from '../../../di';
import type { ConventionalFluentInfo } from '../../../log/types';
import { KnownToken } from '../../../tokens';
import { getClientIp } from '../utils/get-client-ip';
import { toMilliseconds } from '../../../utils';

/**
 * Провайдер промежуточного слоя логирования входящих http-запросов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Промежуточный слой.
 */
export function provideExpressLogMiddleware(resolve: Resolve): express.Handler {
  const config = resolve(KnownToken.Config.base);
  const logger = resolve(KnownToken.logger);

  return (req, res, next) => {
    const start = process.hrtime.bigint();
    const remoteIp = getClientIp(req) ?? '';

    const startMsg: Omit<ConventionalFluentInfo, 'latency' | 'status'> & { type: string } = {
      type: 'http.request[incoming]',
      version: config.appVersion,
      route: req.originalUrl,
      method: req.method,
      remote_ip: remoteIp,
    };

    logger.info(startMsg);

    res.once('finish', () => {
      const finish = process.hrtime.bigint();

      const finishMsg: ConventionalFluentInfo & { type: string } = {
        type: 'http.response[outgoing]',
        version: config.appVersion,
        route: req.originalUrl,
        method: req.method,
        status: res.statusCode,
        remote_ip: remoteIp,
        latency: toMilliseconds(finish - start),
      };

      logger.info(finishMsg);
    });

    next();
  };
}
