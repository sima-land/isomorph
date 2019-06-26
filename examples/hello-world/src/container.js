import config from './config';
import httpHelpers from '../../../src/http-helpers';
import storeCreator from '../../../src/store-creator';
import createContainer from '../../../src/create-container';
import sentryLogger from '../../../src/logger/sentry-logger';
import createSentryMiddleware from '../../../src/logger/create-sentry-middleware';
import createLoggerMiddleware from '../../../src/logger/create-logger-middleware';
import redisCache,
{ reconnectOnError, getRetryStrategy, getOnConnectCallback, getOnReconnectingCallback } from '../../../src/cache';
import { getTracer } from '../../../src/tracer';

const values = [
  { name: 'config', value: config },
  { name: 'httpHelpers', value: httpHelpers },
  { name: 'initialState', value: {} },
  { name: 'middlewares', value: {} },
  { name: 'reducer', value: () => 1 },
  { name: 'compose', value: () => 1 },
  { name: 'getAppRunner', value: () => () => {} },
  { name: 'reconnectOnError', value: reconnectOnError },
  { name: 'getRetryStrategy', value: getRetryStrategy },
  { name: 'getOnConnectCallback', value: getOnConnectCallback },
  { name: 'getOnReconnectingCallback', value: getOnReconnectingCallback },
  { name: 'metrics', value: {} },
  { name: 'logger', value: {} },
];

const singletones = [
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
    dependencies: ['config', 'reconnectOnError',
      'getRetryStrategy', 'getOnConnectCallback', 'getOnReconnectingCallback'],
  },
  {
    name: 'tracer',
    singleton: getTracer,
    dependencies: ['config', 'metrics', 'logger'],
  },

];

const factories = [
  {
    name: 'storeCreator',
    factory: storeCreator,
    dependencies: ['initialState', 'reducer', 'compose', 'middlewares', 'getAppRunner'],
  },
];

const container = createContainer({
  services: [
    ...values,
    ...singletones,
    ...factories,
  ],
});

export default container;
