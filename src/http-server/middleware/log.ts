import type { Handler } from 'express';
import type { BaseConfig } from '../../config/types';
import type { Logger, ConventionalFluentInfo } from '../../log/types';
import { getXClientIp } from '../utils';
import { toMilliseconds } from '../../utils/number';

/**
 * Возвращает новый middleware для логирования запросов.
 * @todo Переделать на получение абстрактного LogHandler'а, бизнес-логику перенести в пресеты.
 * @param config Конфиг.
 * @param logger Logger.
 * @return Middleware.
 */
export function logMiddleware(config: BaseConfig, logger: Logger): Handler {
  return function log(req, res, next) {
    const start = process.hrtime.bigint();
    const remoteIp = getXClientIp(req);

    // @todo перенести в пресеты?
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

      // @todo перенести в пресеты?
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
