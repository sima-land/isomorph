import type { Handler } from 'express';
import type { BaseConfig } from '../../config/types';
import type { Logger, ConventionalFluentInfo } from '../../logger/types';
import { getXClientIp } from '../utils';
import { toMilliseconds } from '../../utils/number';

/**
 * Возвращает новый middleware для логирования запросов.
 * @param config Конфиг.
 * @param logger Logger.
 * @return Middleware.
 */
export function loggingMiddleware(config: BaseConfig, logger: Logger): Handler {
  return function log(req, res, next) {
    const start = process.hrtime.bigint();

    res.once('finish', () => {
      const finish = process.hrtime.bigint();

      // @todo перенести в пресеты?
      const message: ConventionalFluentInfo = {
        version: config.appVersion,
        route: req.originalUrl,
        method: req.method,
        status: res.statusCode,
        remote_ip: getXClientIp(req),
        latency: toMilliseconds(finish - start),
      };

      logger.info(message);
    });

    next();
  };
}
