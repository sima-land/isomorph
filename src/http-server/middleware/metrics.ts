import type { Request, Response, Handler } from 'express';
import type { BaseConfig } from '../../config/types';
import * as PromClient from 'prom-client';
import { toMilliseconds } from '../../utils/number';
import { RESPONSE_EVENT } from '../constants';
import { ConventionalLabels } from '../../metrics/constants';

export function responseMetricsMiddleware(
  config: BaseConfig,
  metrics: {
    counter: PromClient.Counter<typeof ConventionalLabels.HTTP_RESPONSE[number]>;
    histogram: PromClient.Histogram<typeof ConventionalLabels.HTTP_RESPONSE[number]>;
  },
): Handler {
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

  return (req, res, next) => {
    const start = process.hrtime.bigint();

    metrics.counter.inc(resolveLabels(req, res), 1);

    res.once('finish', () => {
      const finish = process.hrtime.bigint();

      metrics.histogram.observe(resolveLabels(req, res), toMilliseconds(finish - start));
    });

    next();
  };
}

export function renderMetricsMiddleware(
  config: BaseConfig,
  metrics: {
    histogram: PromClient.Histogram<typeof ConventionalLabels.SSR[number]>;
  },
): Handler {
  return (req, res, next) => {
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
