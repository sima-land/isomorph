import type { BaseConfig } from '../../../config';
import type { ServerMiddleware } from '../types';
import { PAGE_HANDLER_EVENT_TYPE } from '../constants';
import { toMilliseconds } from '../../../utils';
import { LABEL_NAMES, getHandlerMetrics } from './get-handler-metrics';

/**
 * Возвращает новый промежуточный слой метрки входящего http-запроса.
 * @param config Конфигурация.
 * @return Промежуточный слой.
 */
export function getServeMeasuring(config: BaseConfig): ServerMiddleware {
  const { requestCount, renderDuration, responseDuration } = getHandlerMetrics();

  /** @inheritdoc */
  const getResponseLabels = (req: Request, res: Response) =>
    ({
      version: config.appVersion,
      route: req.url,
      code: res.status,
      method: req.method,
    }) satisfies Record<(typeof LABEL_NAMES.httpResponse)[number], string | number>;

  /** @inheritdoc */
  const getRenderLabels = (request: Request) =>
    ({
      version: config.appVersion,
      method: request.method,
      route: request.url,
    }) satisfies Record<(typeof LABEL_NAMES.pageRender)[number], string | number>;

  return async (request, next, context) => {
    const responseStart = process.hrtime.bigint();
    let renderStart = 0n;

    context.events.addEventListener(
      PAGE_HANDLER_EVENT_TYPE.renderStart,
      () => {
        renderStart = process.hrtime.bigint();
      },
      { once: true },
    );

    context.events.addEventListener(
      PAGE_HANDLER_EVENT_TYPE.renderFinish,
      () => {
        const renderFinish = process.hrtime.bigint();

        renderDuration.observe(
          getRenderLabels(request),
          toMilliseconds(renderFinish - renderStart),
        );
      },
      { once: true },
    );

    const response = await next(request);
    const responseFinish = process.hrtime.bigint();

    responseDuration.observe(
      getResponseLabels(request, response),
      toMilliseconds(responseFinish - responseStart),
    );

    requestCount.inc(getResponseLabels(request, response), 1);

    return response;
  };
}
