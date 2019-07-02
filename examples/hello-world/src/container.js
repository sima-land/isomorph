import config from './config';
import httpHelpers from '../../../src/http-helpers';
import templates from './templates';
import storeCreator from '../../../src/store-creator';
import createContainer from '../../../src/create-container';
import sentryLogger from '../../../src/logger/sentry-logger';
import createSentryMiddleware from '../../../src/logger/create-sentry-middleware';
import createLoggerMiddleware from '../../../src/logger/create-logger-middleware';
import createPinoInstance from '../../../src/logger/helpers/create-pino-instance';
import {
  PrometheusMetric,
  createRequestMiddleware,
} from '../../../src/prometheus-helpers/';
import redisCache, {
  reconnectOnError,
  getRetryStrategy,
  getOnConnectCallback,
  getOnReconnectingCallback,
} from '../../../src/cache';
import { decorateGracefulShutdown } from '../../../src/graceful-shutdown/';
import { getTracer } from '../../../src/tracer';
import { getTemplate } from '../../../src/render/render';

const values = [
  { name: 'config', value: config },
  { name: 'httpHelpers', value: httpHelpers },
  { name: 'templates', value: templates },
  { name: 'initialState', value: {} },
  { name: 'middlewares', value: {} },
  { name: 'reducer', value: () => 1 },
  { name: 'compose', value: () => 1 },
  { name: 'getAppRunner', value: () => () => {} },
  { name: 'reconnectOnError', value: reconnectOnError },
  { name: 'getRetryStrategy', value: getRetryStrategy },
  { name: 'getOnConnectCallback', value: getOnConnectCallback },
  { name: 'getOnReconnectingCallback', value: getOnReconnectingCallback },
  { name: 'processExitTimeout', value: 10000 },
  {
    name: 'requestStartMetrics',
    value: [
      new PrometheusMetric('Counter', {
        name: 'request_counter',
        help: 'request counter',
        labelNames: ['place', 'route', 'statusCode'],
      }),
    ],
  },
  {
    name: 'metricLabelsResolver',
    value: ({ dependencies: { config }, request, response }) => ({
      place: config.place || 'dev',
      route: request.path,
      statusCode: response.statusCode,
    }),
  },
  { name: 'metrics', value: {} },
  { name: 'logger', value: {} },
];

const singletons = [
  {
    name: 'pinoLogger',
    singleton: createPinoInstance,
    dependencies: ['config'],
  },
  {
    name: 'onExitError',
    singleton: ({ pinoLogger, config }) => () => {
      const { isDevelopment = true } = config || {};
      isDevelopment && pinoLogger.info('Could not close connections in time, forcefully shutting down');
    },
    dependencies: ['pinoLogger', 'config'],
  },
  {
    name: 'onExitSuccess',
    singleton: ({ pinoLogger, config }) => () => {
      const { isDevelopment = true } = config || {};
      isDevelopment && pinoLogger.info('Closed out remaining connections.');
    },
    dependencies: ['pinoLogger', 'config'],
  },
  {
    name: 'requestMetricsMiddleware',
    singleton: createRequestMiddleware,
    dependencies: [
      'config',
      { startMetrics: 'requestStartMetrics' },
      { resolveLabels: 'metricLabelsResolver' },
    ],
  },
  {
    name: 'loggerMiddleware',
    singleton: createLoggerMiddleware,
    dependencies: ['config', 'httpHelpers'],
  },
  {
    name: 'sentryMiddleware',
    singleton: createSentryMiddleware,
    dependencies: ['config'],
  },
  {
    name: 'sentryLogger',
    singleton: sentryLogger,
  },
  {
    name: 'cache',
    singleton: redisCache,
    dependencies: [
      'config',
      'reconnectOnError',
      'getRetryStrategy',
      'getOnConnectCallback',
      'getOnReconnectingCallback',
    ],
  },
  {
    name: 'tracer',
    singleton: getTracer,
    dependencies: ['config', 'metrics', 'logger'],
  },

];

const factories = [
  {
    name: 'decorateGracefulShutdown',
    singleton: ({
      onExitError: onError,
      onExitSuccess: onSuccess,
      processExitTimeout: timeout,
    }) => server => decorateGracefulShutdown(server, {
      onError,
      onSuccess,
      timeout,
    }),
    dependencies: [
      'processExitTimeout',
      'onExitError',
      'onExitSuccess',
    ],
  },
  {
    name: 'storeCreator',
    factory: storeCreator,
    dependencies: ['initialState', 'reducer', 'compose', 'middlewares', 'getAppRunner'],
  },
  {
    name: 'getTemplate',
    singleton: getTemplate,
    dependencies: ['templates', 'config'],
  },
];

const container = createContainer({
  services: [
    ...values,
    ...singletons,
    ...factories,
  ],
});

export default container;
