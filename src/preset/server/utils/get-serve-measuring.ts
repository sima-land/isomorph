import type { BaseConfig } from '../../../config';
import type { ServerMiddleware } from '../types';
import { RESPONSE_EVENT_TYPE } from '../../isomorphic/constants';
import { toMilliseconds } from '../../../utils';
import PromClient from 'prom-client';

/**
 * Возвращает новый промежуточный слой метрки входящего http-запроса.
 * @param config Конфигурация.
 * @return Промежуточный слой.
 */
export function getServeMeasuring(config: BaseConfig): ServerMiddleware {
  const ConventionalLabels = {
    HTTP_RESPONSE: ['version', 'route', 'code', 'method'],
    SSR: ['version', 'route', 'method'],
  } as const;

  // @todo скорее всего стоит сделать обертки над классами из PromClient чтобы вызывать у них методы замера а они уже сами вычисляли лейблы и тд
  const requestCount = new PromClient.Counter({
    name: 'http_request_count',
    help: 'Incoming HTTP request count',
    labelNames: ConventionalLabels.HTTP_RESPONSE,
  });

  const responseDuration = new PromClient.Histogram({
    name: 'http_response_duration_ms',
    help: 'Duration of incoming HTTP requests in ms',
    labelNames: ConventionalLabels.HTTP_RESPONSE,
    buckets: [30, 100, 200, 500, 1000, 2500, 5000, 10000],
  });

  const renderDuration = new PromClient.Histogram({
    name: 'render_duration_ms',
    help: 'Duration of SSR ms',
    labelNames: ConventionalLabels.SSR,
    buckets: [0.1, 15, 50, 100, 250, 500, 800, 1500],
  });

  /** @inheritdoc */
  const getResponseLabels = (req: Request, res: Response) =>
    ({
      version: config.appVersion,
      route: req.url,
      code: res.status,
      method: req.method,
    }) satisfies Record<(typeof ConventionalLabels.HTTP_RESPONSE)[number], string | number>;

  /** @inheritdoc */
  const getRenderLabels = (request: Request) =>
    ({
      version: config.appVersion,
      method: request.method,
      route: request.url,
    }) satisfies Record<(typeof ConventionalLabels.SSR)[number], string | number>;

  return async (request, next, context) => {
    const responseStart = process.hrtime.bigint();
    let renderStart = 0n;

    context.events.addEventListener(
      RESPONSE_EVENT_TYPE.renderStart,
      () => {
        renderStart = process.hrtime.bigint();
      },
      { once: true },
    );

    context.events.addEventListener(
      RESPONSE_EVENT_TYPE.renderFinish,
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
