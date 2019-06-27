import express from 'express';
import container from './container';
import { PrometheusClient } from '../../../src/prometheus-helpers/';

const mainApp = express();
const mainPort = 3000;

const metricsApp = express();
const metricsPort = 3001;

// initialize example app
mainApp.use(container.get('loggerMiddleware'));
mainApp.use(container.get('sentryMiddleware'));
mainApp.use(container.get('requestMetricsMiddleware'));
mainApp.get('/', (request, response) => response.send('Hello World!'));
mainApp.listen(mainPort);

// initialize  prometheus metrics app
metricsApp.get('/', (request, response) => {
  response.set('Content-Type', PrometheusClient.register.contentType);
  response.send(PrometheusClient.register.metrics());
});
metricsApp.listen(metricsPort);
