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
import { labelsResolver } from '../../../src/helpers/metrics';
import createRedisCache from '../../../src/cache/redis';
import { getTemplate } from '../../../src/helpers/render';
import { gracefulShutdownCreator, onExitHandlerCreator } from '../../../src/graceful-shutdown/';
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
import { getDynamicData } from '../../../src/get-dynamic-data';
import getDevComposeCreator from '../../../src/helpers/redux/get-dev-compose-creator';
import * as Sentry from '@sentry/node';
import { createChildTracingMiddleware } from '../../../src/helpers/tracer/create-child-tracing-middleware';
import http from 'http';
import https from 'https';
import createSentryInstance from '../../../src/logger/create-sentry-instance';
import { createDefaultScopeConfigurator } from '../../../src/logger/handler-creators';

const values = [
  { name: 'config', value: appConfig },
  { name: 'templates', value: templates },
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
        value: labelsResolver,
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
    singleton: onExitHandlerCreator,
    dependencies: [
      {
        logger: 'pinoLogger',
      },
      'config',
      {
        name: 'message',
        value: 'Could not close connections in time, forcefully shutting down',
      },
    ],
  },
  {
    name: 'onExitSuccess',
    singleton: onExitHandlerCreator,
    dependencies: [
      {
        logger: 'pinoLogger',
      },
      'config',
      {
        name: 'message',
        value: 'Closed out remaining connections.',
      },
    ],
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
        value: labelsResolver,
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
    name: 'getDynamicData',
    singleton: getDynamicData,
    dependencies: [
      'config',
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
    name: 'devToolsComposeCreator',
    singleton: getDevComposeCreator,
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
    singleton: gracefulShutdownCreator,
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
