import type { Request, Response, Handler } from 'express';
import type { BaseConfig } from '../../config/types';
import * as PromClient from 'prom-client';
import { toMilliseconds } from '../../utils/number';
import { RESPONSE_EVENT } from '../constants';
import { ConventionalLabels } from '../../metrics/constants';

/**
 * Возвращает новый middleware для формирования метрик входящего запроса.
 * @param config Конфиг.
 * @param metrics Метрики - счетчик запросов и гистограмма длительности ответа.
 * @return Middleware.
 */
export function responseMetricsMiddleware(
  config: BaseConfig,
  metrics: {
    counter: PromClient.Counter<typeof ConventionalLabels.HTTP_RESPONSE[number]>;
    histogram: PromClient.Histogram<typeof ConventionalLabels.HTTP_RESPONSE[number]>;
  },
): Handler {
  // eslint-disable-next-line require-jsdoc, jsdoc/require-jsdoc
  function resolveLabels(
    req: Request,
    res: Response,
  ): Record<typeof ConventionalLabels.HTTP_RESPONSE[number], string | number> {
    return {
      version: config.appVersion,
      route: req.baseUrl + req.path,
      code: res.statusCode,
      method: req.method,
    };
  }

  return function responseMetrics(req, res, next) {
    const start = process.hrtime.bigint();

    metrics.counter.inc(resolveLabels(req, res), 1);

    res.once('finish', () => {
      const finish = process.hrtime.bigint();

      metrics.histogram.observe(resolveLabels(req, res), toMilliseconds(finish - start));
    });

    next();
  };
}

/**
 * Возвращает новый middleware для формирования метрик рендеринга верстки.
 * @param config Конфиг.
 * @param metrics Метрики - гистограмма длительности рендеринга.
 * @return Middleware.
 */
export function renderMetricsMiddleware(
  config: BaseConfig,
  metrics: {
    histogram: PromClient.Histogram<typeof ConventionalLabels.SSR[number]>;
  },
): Handler {
  return function renderMetrics(req, res, next) {
    let start: bigint | undefined;

    res.once(RESPONSE_EVENT.renderStart, () => {
      start = process.hrtime.bigint();
    });

    res.once(RESPONSE_EVENT.renderFinish, () => {
      if (typeof start !== 'bigint') {
        throw Error('Looks like "render start" event not emitted');
      }

      const finish = process.hrtime.bigint();

      metrics.histogram.observe(
        {
          version: config.appVersion,
          method: req.method,
          route: req.baseUrl + req.path,
        },
        toMilliseconds(finish - start),
      );
    });

    next();
  };
}
