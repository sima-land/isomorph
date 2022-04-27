import express, { Application } from 'express';
import * as PromClient from 'prom-client';
import { ConventionalLabels } from './constants';

export interface DefaultNodeMetrics {
  requestCount: PromClient.Counter<typeof ConventionalLabels.HTTP_RESPONSE[number]>;
  responseDuration: PromClient.Histogram<typeof ConventionalLabels.HTTP_RESPONSE[number]>;
  renderDuration: PromClient.Histogram<typeof ConventionalLabels.SSR[number]>;
}

/**
 * Возвращает новое express-приложение, настроенное для выдачи информации о метриках.
 * @return Приложение.
 */
export function createMetricsHttpApp(): Application {
  const app = express();

  PromClient.collectDefaultMetrics();

  app.get('/', async function (req, res) {
    const metrics = await PromClient.register.metrics();

    res.setHeader('Content-Type', PromClient.register.contentType);
    res.send(metrics);
  });

  return app;
}

/**
 * Возвращает набор готовых метрик по умолчанию для приложений.
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
