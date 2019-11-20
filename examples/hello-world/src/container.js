import config from './config';
import { getMethod, getStatus, getXClientIp } from '../../../src/helpers/http';
import templates from './templates';
import { createStoreService } from '../../../src/helpers/saga';
import create from '../../../src/container';
import sentryLogger from '../../../src/logger/sentry-logger';
import createSentryMiddleware from '../../../src/logger/create-sentry-middleware';
import createLoggerMiddleware from '../../../src/logger/create-logger-middleware';
import createPinoInstance from '../../../src/helpers/logger/create-pino-instance';
import {
  PrometheusMetric,
  createMeasureMiddleware,
} from '../../../src/helpers/prometheus/';
import createRedisCache from '../../../src/cache';
import { getTemplate, prepareRenderFunction } from '../../../src/helpers/render';
import isLoadFinish from './redux/selectors/is-load-finish';
import { reducer } from './redux/reducers';
import { createRootSaga } from './sagas';
import { getStateService } from './sagas/get-final-state';
import { decorateGracefulShutdown } from '../../../src/graceful-shutdown/';
import {
  getTracer,
  traceIncomingRequest,
  createTracingMiddleware,
  getSpanContext,
} from '../../../src/helpers/tracer';
import getParams, { parseHttpHeaders } from '../../../src/get-params/get-params';
import wrapInTrace from '../../../src/cache/wrap-in-trace';
import Raven from 'raven';
import axiosInstanceConstructor from '../../../src/helpers/api/create-instance';
import enhancerConstructor from '../../../src/helpers/api/create-enhancer';
import createTraceRequestMiddleware from '../../../src/helpers/api/middlewares/trace-request-middleware';

const values = [
  { name: 'config', value: config },
  { name: 'templates', value: templates },
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
          version: config.buildVersion || 'development',
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
      'config',
      'pinoLogger',
      {
        name: 'getDynamicData',
        value: (request, response) => ({
          remote_ip: getXClientIp({ request }),
          method: getMethod({ request }),
          status: getStatus({ response }),
        }),
      },
    ],
  },
  {
    name: 'sentryMiddleware',
    singleton: createSentryMiddleware,
    dependencies: ['config'],
  },
  {
    name: 'wrapInTrace',
    singleton: wrapInTrace,
    dependencies: ['tracer', 'cache', 'context'],
  },
  {
    name: 'sentryLogger',
    singleton: sentryLogger,
    dependencies: [
      { name: 'sentryLoggerService', value: Raven },
    ],
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
      'config',
      { name: 'metrics', value: {} },
      { name: 'logger', value: {} },
    ],
  },
  {
    name: 'tracingMiddleware',
    singleton: ({ createSpan, onSpanFinish }) => createTracingMiddleware(
      createSpan,
      onSpanFinish,
    ),
    dependencies: [
      { createSpan: 'createJaegerSpan' },
      {
        name: 'onSpanFinish',
        value: (req, res, span) => span.finish(),
      },
    ],
  },
  {
    name: 'createJaegerSpan',
    singleton: ({ jaegerTracer }) => request => traceIncomingRequest(
      jaegerTracer,
      'incoming-http-request',
      request,
    ),
    dependencies: ['jaegerTracer'],
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
];

const factories = [
  {
    name: 'helloInitialSaga',
    factory: createRootSaga,
    dependencies: [
      'axiosInstance',
    ],
  },
  {
    name: 'helloStore',
    factory: createStoreService,
    dependencies: [
      {
        name: 'reducer',
        value: reducer,
      },
      {
        initialSaga: 'helloInitialSaga',
      },
      {
        name: 'isReady',
        value: isLoadFinish,
      },
      {
        name: 'timeout',
        value: 100,
      },
    ],
  },
  {
    name: 'helloState',
    factory: getStateService,
    dependencies: [
      { store: 'helloStore' },
    ],
  },
  {
    name: 'helloRouteRender',
    factory: prepareRenderFunction,
    dependencies: [
      {
        name: 'render',
        value: ({ output }) => output,
      },
    ],
  },
  {
    name: 'context',
    factory: getSpanContext,
  },
  {
    name: 'axiosInstance',
    factory: axiosInstanceConstructor,
    dependencies: [
      {
        name: 'config',
        value: {
          baseURL: `${config.simalandApiUrl}/api/v3`,
        },
      },
      {
        enhancer: 'axiosEnhancer',
      },
    ],
  },
  {
    name: 'axiosEnhancer',
    factory: enhancerConstructor,
    dependencies: [
      {
        name: 'constructors',
        value: [
          createTraceRequestMiddleware,
        ],
      },
      'context',
      { tracer: 'jaegerTracer' },
    ],
  },
  {
    name: 'params',
    factory: getParams,
    dependencies: [
      {
        name: 'getValue',
        value: parseHttpHeaders,
      },
      {
        name: 'defaultValue',
        value: {
          api_host: '',
        },
      },
      'config',
    ],
  },
];

const container = create({
  services: [
    ...values,
    ...singletons,
    ...factories,
  ],
});

export default container;
