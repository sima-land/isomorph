import appConfig from './config';
import { getMethod, getStatus, getXClientIp } from '../../../src/helpers/http/request-getters';
import templates from './templates';
import { createSingleton } from '../../../src/container';
import sentryLogger from '../../../src/logger/sentry-logger';
import { createSentryMiddleware } from '../../../src/logger/create-sentry-middleware';
import createLoggerMiddleware from '../../../src/logger/create-logger-middleware';
import createPinoInstance from '../../../src/helpers/logger/create-pino-instance';
import {
  PrometheusMetric,
  createMeasureMiddleware,
} from '../../../src/helpers/prometheus/';
import createRedisCache from '../../../src/cache/redis';
import { getTemplate } from '../../../src/helpers/render';
import { decorateGracefulShutdown } from '../../../src/graceful-shutdown/';
import {
  getTracer,
  tracingMiddlewareCreator,
  createSpanCreator,
  spanFinishHandler,
} from '../../../src/helpers/tracer';
import wrapInTrace from '../../../src/cache/wrap-in-trace';
import createSetHeaderMiddleware from '../../../src/set-header-middleware/create';
import createInject from '../../../src/container/create-inject';
import initializeSentryCreator from '../../../src/logger/initialize-sentry-creator';
import * as Sentry from '@sentry/node';
import { createChildTracingMiddleware } from '../../../src/helpers/tracer/create-child-tracing-middleware';
import http from 'http';
import https from 'https';
import createSentryInstance from '../../../src/logger/create-sentry-instance';
import { createDefaultScopeConfigurator } from '../../../src/logger/handler-creators';

const values = [
  { name: 'config', value: appConfig },
  { name: 'templates', value: templates },
  { name: 'timeDataKey', value: 'customKey' },
  { name: 'serviceUserAgent', value: 'simaland-example/1' },
  { name: 'httpAgent', value: new http.Agent({ keepAlive: true }) },
  { name: 'httpsAgent', value: new https.Agent({ keepAlive: true }) },
];

const singletons = [
  {
    name: 'requestMetricsMiddleware',
    singleton: createMeasureMiddleware,
    dependencies: [
      'config',
      {
        name: 'startMetrics',
        value: [
          new PrometheusMetric('Counter', {
            name: 'request_counter',
            help: 'request counter',
            labelNames: ['place', 'route', 'statusCode'],
          }),
        ],
      },
      {
        name: 'finishMetrics',
        value: [
          new PrometheusMetric('Histogram', {
            name: 'http_response_duration_ms',
            help: 'Duration of HTTP requests in ms',
            labelNames: ['place', 'route', 'statusCode'],
            buckets: [30, 100, 200, 500, 1000, 2500, 5000, 10000],
          }),
        ],
      },
      {
        name: 'resolveLabels',
        value: ({ dependencies: { config }, request, response }) => ({
          place: config.place || 'dev',
          route: request.path,
          statusCode: response.statusCode,
        }),
      },
    ],
  },
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
    name: 'renderMetricsMiddleware',
    singleton: createMeasureMiddleware,
    dependencies: [
      'config',
      {
        name: 'finishMetrics',
        value: [
          new PrometheusMetric('Histogram', {
            name: 'render_duration_ms',
            help: 'Duration of SSR ms',
            labelNames: ['version', 'place'],
            buckets: [0.1, 15, 50, 100, 250, 500, 800, 1500],
          }),
        ],
      },
      {
        name: 'resolveLabels',
        value: ({ dependencies: { config } }) => ({
          place: config.place || 'dev',
          version: config.version || 'development',
        }),
      },
      {
        name: 'startSubscriber',
        value: ({ response, callback }) => response.once('render:start', callback),
      },
      {
        name: 'finishSubscriber',
        value: ({ response, callback }) => response.once('render:finish', callback),
      },
    ],
  },
  {
    name: 'loggerMiddleware',
    singleton: createLoggerMiddleware,
    dependencies: [
      'pinoLogger',
      {
        name: 'getDynamicData',
        value: (request, response) => ({
          remote_ip: getXClientIp({ request }),
          method: getMethod({ request }),
          status: getStatus({ response }),
        }),
      },
      {
        name: 'exclusions',
        value: [
          'healthcheck',
          '/foo/.*',
        ],
      },
    ],
  },
  {
    name: 'sentryLoggerService',
    singleton: createSentryInstance,
    dependencies: [{
      name: 'sentry',
      value: Sentry,
    }],
  },
  {
    name: 'initializeSentry',
    singleton: initializeSentryCreator,
    dependencies: [
      'sentryLoggerService',
      'getSentryDsn',
      'getSentryOptions',
      'configureMainScope',
    ],
  },
  {
    name: 'configureMainScope',
    singleton: createDefaultScopeConfigurator,
    dependencies: ['config'],
  },
  {
    name: 'getSentryDsn',
    singleton: ({ config }) => () => config.sentryDsnServer,
    dependencies: ['config'],
  },
  {
    name: 'getSentryOptions',
    singleton: ({ config }) => () => config.sentryOptions,
    dependencies: ['config'],
  },
  {
    name: 'sentryMiddleware',
    singleton: createSentryMiddleware,
  },
  {
    name: 'wrapInTrace',
    singleton: wrapInTrace,
    dependencies: ['tracer', 'cache', 'context'],
  },
  {
    name: 'sentryLogger',
    singleton: sentryLogger,
    dependencies: ['sentryLoggerService'],
  },
  {
    name: 'cache',
    singleton: createRedisCache,
    dependencies: [
      'config',
    ],
  },
  {
    name: 'getTemplate',
    singleton: getTemplate,
    dependencies: ['config', { name: 'templates', value: templates }],
  },
  {
    name: 'jaegerTracer',
    singleton: getTracer,
    dependencies: [
      'tracerConfig',
    ],
  },
  {
    name: 'tracerConfig',
    singleton: ({ config: { version, serviceName } }) => ({
      serviceName,
      version,
    }),
    dependencies: ['config'],
  },
  {
    name: 'tracingMiddleware',
    singleton: tracingMiddlewareCreator,
    dependencies: [
      { createSpan: 'createJaegerSpan' },
      {
        name: 'onSpanFinish',
        value: spanFinishHandler,
      },
    ],
  },
  {
    name: 'createJaegerSpan',
    singleton: createSpanCreator,
    dependencies: [
      'jaegerTracer',
      'config',
    ],
  },
  {
    name: 'decorateGracefulShutdown',
    singleton: (
      {
        onExitError: onError,
        onExitSuccess: onSuccess,
        processExitTimeout: timeout,
      }
    ) => server => decorateGracefulShutdown(server, {
      onError,
      onSuccess,
      timeout,
    }),
    dependencies: [
      {
        name: 'processExitTimeout',
        value: 10000,
      },
      'onExitError',
      'onExitSuccess',
    ],
  },
  {
    name: 'createSetHeaderMiddleware',
    singleton: createSetHeaderMiddleware,
    dependencies: [
      {
        name: 'headers',
        value: {
          'Js-Header-Name': '/bundle.js',
          'CSS-Header-Name': '/bundle.css',
        },
      },
    ],
  },
  {
    name: 'renderTracingMiddleware',
    singleton: createChildTracingMiddleware,
    dependencies: [
      {
        name: 'spanName',
        value: 'server-side-rendering',
      },
      {
        tracer: 'jaegerTracer',
      },
      {
        name: 'startSubscriber',
        value: ({ response, callback }) => response.once('render:start', callback),
      },
      {
        name: 'finishSubscriber',
        value: ({ response, callback }) => response.once('render:end', callback),
      },
    ],
  },
];

export const getAppContainer = createSingleton({
  services: [
    ...values,
    ...singletons,
  ],
});

const inject = createInject(getAppContainer);

export default inject;
