import config from './config';
import httpHelpers from '../../../src/http-helpers';
import createContainer from '../../../src/create-container';
import sentryLogger from '../../../src/logger/sentry-logger';
import createSentryMiddleware from '../../../src/logger/create-sentry-middleware';
import createLoggerMiddleware from '../../../src/logger/create-logger-middleware';
import redisCache,
{ reconnectOnError, getRetryStrategy, getOnConnectCallback, getOnReconnectingCallback } from '../../../src/cache';

const values = [
  { name: 'config', value: config },
  { name: 'httpHelpers', value: httpHelpers },
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
    dependencies: ['config', reconnectOnError, getRetryStrategy, getOnConnectCallback, getOnReconnectingCallback],
  },
];

const container = createContainer({
  services: [
    ...values,
    ...singletones,
  ],
});

export default container;
