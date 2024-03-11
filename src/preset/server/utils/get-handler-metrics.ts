import PromClient from 'prom-client';

export const LABEL_NAMES = {
  httpResponse: ['version', 'route', 'code', 'method'],
  pageRender: ['version', 'route', 'method'],
} as const;

/**
 * Возвращает метрики обработки входящего http-запроса.
 * @return Метрики.
 */
export function getHandlerMetrics() {
  const requestCount = new PromClient.Counter({
    name: 'http_request_count',
    help: 'Incoming HTTP request count',
    labelNames: LABEL_NAMES.httpResponse,
  });

  const responseDuration = new PromClient.Histogram({
    name: 'http_response_duration_ms',
    help: 'Duration of incoming HTTP requests in ms',
    labelNames: LABEL_NAMES.httpResponse,
    buckets: [30, 100, 200, 500, 1000, 2500, 5000, 10000],
  });

  const renderDuration = new PromClient.Histogram({
    name: 'render_duration_ms',
    help: 'Duration of SSR ms',
    labelNames: LABEL_NAMES.pageRender,
    buckets: [0.1, 15, 50, 100, 250, 500, 800, 1500],
  });

  return {
    requestCount,
    renderDuration,
    responseDuration,
  };
}
