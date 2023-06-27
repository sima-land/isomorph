import * as PromClient from 'prom-client';
import { ConventionalLabels } from './constants';

/**
 * Распространенные метрики для Node.js приложения.
 * @todo Унести это в пресет.
 */
export interface DefaultNodeMetrics {
  /** Счетчик входящих запросов. */
  requestCount: PromClient.Counter<(typeof ConventionalLabels.HTTP_RESPONSE)[number]>;

  /** Гистограмма длительности ответа. */
  responseDuration: PromClient.Histogram<(typeof ConventionalLabels.HTTP_RESPONSE)[number]>;

  /** Гистограмма длительности SSR. */
  renderDuration: PromClient.Histogram<(typeof ConventionalLabels.SSR)[number]>;
}

/**
 * Возвращает набор готовых метрик по умолчанию для приложений.
 * @todo Унести это в пресет.
 * @return Набор метрик.
 */
export function createDefaultMetrics(): DefaultNodeMetrics {
  return {
    requestCount: new PromClient.Counter({
      name: 'http_request_count',
      help: 'Incoming HTTP request count',
      labelNames: ConventionalLabels.HTTP_RESPONSE,
    }),
    responseDuration: new PromClient.Histogram({
      name: 'http_response_duration_ms',
      help: 'Duration of incoming HTTP requests in ms',
      labelNames: ConventionalLabels.HTTP_RESPONSE,
      buckets: [30, 100, 200, 500, 1000, 2500, 5000, 10000],
    }),
    renderDuration: new PromClient.Histogram({
      name: 'render_duration_ms',
      help: 'Duration of SSR ms',
      labelNames: ConventionalLabels.SSR,
      buckets: [0.1, 15, 50, 100, 250, 500, 800, 1500],
    }),
  };
}
