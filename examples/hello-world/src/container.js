import config from './config';
import createProxy from '../../../src/create-proxy';
import httpHelpers from '../../../src/http-helpers';
import createContainer from '../../../src/create-container';
import sentryLogger from '../../../src/logger/sentry-logger';
import createSentryMiddleware from '../../../src/logger/create-sentry-middleware';
import createLoggerMiddleware from '../../../src/logger/create-logger-middleware';

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
    name: 'proxy',
    factory: createProxy,
    dependencies: ['config'],
  },
];

const container = createContainer({
  services: [
    ...values,
    ...singletones,
  ],
});

export default container;
