import * as PromClient from 'prom-client';
import express from 'express';

/**
 * Провайдер express-приложения метрик.
 * @return Пул известных http-хостов.
 */
export function provideMetricsHttpApp(): express.Application {
  PromClient.collectDefaultMetrics();

  const app = express();

  app.get('/', async function (req, res) {
    const metrics = await PromClient.register.metrics();

    res.setHeader('Content-Type', PromClient.register.contentType);
    res.send(metrics);
  });

  return app;
}
