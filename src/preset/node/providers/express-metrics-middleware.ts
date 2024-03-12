import type express from 'express';
import type { Resolve } from '../../../di';
import { LABEL_NAMES, getHandlerMetrics } from '../../server/utils/get-handler-metrics';
import { KnownToken } from '../../../tokens';
import { PAGE_HANDLER_EVENT_TYPE } from '../../server';
import { toMilliseconds } from '../../../utils';

/**
 * Провайдер промежуточного слоя сбора метрик входящих http-запросов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Промежуточный слой.
 */
export function provideExpressMetricsMiddleware(resolve: Resolve): express.Handler {
  const config = resolve(KnownToken.Config.base);
  const { requestCount, renderDuration, responseDuration } = getHandlerMetrics();

  /**
   * Функция формирования labels.
   * @param req Request.
   * @param res Response.
   * @return Labels.
   */
  const getLabels = (
    req: express.Request,
    res: express.Response,
  ): Record<(typeof LABEL_NAMES.httpResponse)[number], string | number> => ({
    version: config.appVersion,
    route: req.baseUrl + req.path,
    code: res.statusCode,
    method: req.method,
  });

  /** @inheritdoc */
  const getRenderLabels = (request: express.Request) =>
    ({
      version: config.appVersion,
      method: request.method,
      route: request.url,
    }) satisfies Record<(typeof LABEL_NAMES.pageRender)[number], string | number>;

  return (req, res, next) => {
    const responseStart = process.hrtime.bigint();

    requestCount.inc(getLabels(req, res), 1);

    res.once(PAGE_HANDLER_EVENT_TYPE.renderStart, () => {
      const renderStart = process.hrtime.bigint();

      res.once(PAGE_HANDLER_EVENT_TYPE.renderFinish, () => {
        const renderFinish = process.hrtime.bigint();

        renderDuration.observe(getRenderLabels(req), toMilliseconds(renderFinish - renderStart));
      });
    });

    res.once('finish', () => {
      const responseFinish = process.hrtime.bigint();

      responseDuration.observe(getLabels(req, res), toMilliseconds(responseFinish - responseStart));
    });

    next();
  };
}
