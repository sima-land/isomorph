import config from './config';
import httpHelpers from '../../../src/http-helpers';
import storeCreator from '../../../src/store-creator';
import createContainer from '../../../src/create-container';
import sentryLogger from '../../../src/logger/sentry-logger';
import createSentryMiddleware from '../../../src/logger/create-sentry-middleware';
import createLoggerMiddleware from '../../../src/logger/create-logger-middleware';

const values = [
  { name: 'config', value: config },
  { name: 'httpHelpers', value: httpHelpers },
  { name: 'initialState', value: {} },
  { name: 'middleware', value: [] },
  { name: 'reducer', value: () => 1 },
  { name: 'compose', value: () => 1 },
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
];

const factories = [
  {
    name: 'storeCreator',
    factory: storeCreator,
    dependencies: ['initialState', 'reducer', 'compose', 'middleware'],
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
