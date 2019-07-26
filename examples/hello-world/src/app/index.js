import container from '../container';
import PrometheusClient from 'prom-client';
import express from 'express';
import { wrapInContext } from '../../../../src/container';
import helloWorldHandler from '../handlers/hello-world';
import { addErrorHandling } from '../../../../src/helpers/add-error-handling/index.js';

/**
 * Ининциализирует приложение.
 * @param {Object} config Конфигурация приложения.
 * @param {number} config.mainPort Порт для основного сервера приложения.
 * @param {number} config.metricsPort Порт для сервера сбора метрик приложения.
 * @param {Function} loggerMiddleware Промежуточный слой для логгирования.
 * @param {Function} sentryMiddleware Промежуточный слой для перехвата ошибок.
 * @param {Function} requestMetricsMiddleware Промежуточный слой для сбора метрик запросов.
 * @param {Function} renderMetricsMiddleware Промежуточный слой для сбора метрик рендеринга.
 * @param {Function} tracingMiddleware Промежуточный слой для трассировки запросов в приложении.
 * @param {Function} gracefulShutdown Функция для обработки завершения приложения.
 */
export const initialize = (
  {
    mainPort = 3000,
    metricsPort = 3001,
  } = {},
  loggerMiddleware,
  sentryMiddleware,
  requestMetricsMiddleware,
  renderMetricsMiddleware,
  tracingMiddleware,
  gracefulShutdown,
) => {
  const server = express()
    .use(loggerMiddleware)
    .use(requestMetricsMiddleware)
    .use(renderMetricsMiddleware)
    .use(tracingMiddleware)
    .get('/', addErrorHandling(helloWorldHandler))
    .use(sentryMiddleware)
    .listen(mainPort);
  gracefulShutdown(server);

  // initialize  prometheus metrics app
  express()
    .get('/', (request, response) => {
      response.set('Content-Type', PrometheusClient.register.contentType);
      response.send(PrometheusClient.register.metrics());
    })
    .listen(metricsPort);
};

export default wrapInContext(
  {
    container,
    fn: initialize,
    dependencies: [
      'config',
      'loggerMiddleware',
      'sentryMiddleware',
      'requestMetricsMiddleware',
      'renderMetricsMiddleware',
      'tracingMiddleware',
      'decorateGracefulShutdown',
    ],
  }
);
