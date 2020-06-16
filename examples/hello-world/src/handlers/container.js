import { getAppContainer } from '../container';
import { createFactory } from '../../../../src/container';
import { createRootSaga } from '../sagas';
import { createStoreService } from '../../../../src/helpers/saga/create-store';
import { reducer } from '../redux/reducers';
import isLoadFinish from '../redux/selectors/is-load-finish';
import { getStateService } from '../sagas/get-final-state';
import { prepareRenderFunction } from '../../../../src/helpers/render';
import { getSpanContext } from '../../../../src/helpers/tracer';
import axiosInstanceConstructor from '../../../../src/helpers/api/create-instance';
import config from '../config';
import enhancerConstructor from '../../../../src/helpers/api/create-enhancer';
import createTraceRequestMiddleware from '../../../../src/helpers/api/middlewares/trace-request-middleware';
import {
  createPassHeadersMiddleware,
  prepareRequestHeaders,
} from '../../../../src/helpers/api/middlewares/pass-headers-middleware';
import createCollectCookieMiddleware from '../../../../src/helpers/api/middlewares/collect-cookie-middleware';
import createCountApiResponseTimeMiddleware from '../../../../src/helpers/api/middlewares/count-api-response-time';
import getParams, { parseHttpHeaders } from '../../../../src/helpers/get-params';
import createInject from '../../../../src/container/create-inject';
import adapter from '../../../../src/helpers/api/server-adapter';
import createStagesTraceRequestMiddleware from '../../../../src/helpers/api/middlewares/stages-trace-middleware';
import createSetHttpAgentsMiddleware from '../../../../src/helpers/api/middlewares/set-http-agents-middleware';
import { createSentryHandlerForSagas, createSentryHandlerForStore } from '../../../../src/logger/handler-creators';
import {
  createHandleExceptionMiddleware,
  createAttachBreadcrumbsMiddleware,
} from '../../../../src/helpers/api/middlewares/error-handlers-middlewares';

const services = [
  {
    name: 'helloInitialSaga',
    singleton: createRootSaga,
    dependencies: [
      'axiosInstance',
      'cache',
    ],
  },
  {
    name: 'helloStore',
    singleton: createStoreService,
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
      'onSagasErrorHandler',
      'onTimeout',
    ],
  },
  {
    name: 'onSagasErrorHandler',
    singleton: createSentryHandlerForSagas,
    dependencies: [{ sentry: 'sentryLogger' }], // Эта зависимость в родительском контейнере.
  },
  {
    name: 'onTimeout',
    singleton: createSentryHandlerForStore,
    dependencies: [{ sentry: 'sentryLogger' }],
  },
  {
    name: 'helloState',
    singleton: getStateService,
    dependencies: [
      { store: 'helloStore' },
    ],
  },
  {
    name: 'helloRouteRender',
    singleton: prepareRenderFunction,
    dependencies: [
      {
        name: 'render',
        value: ({ output }) => output,
      },
      'response',
    ],
  },
  {
    name: 'context',
    singleton: getSpanContext,
    dependencies: [
      'response',
    ],
  },
  {
    name: 'axiosInstance',
    singleton: axiosInstanceConstructor,
    dependencies: [
      {
        name: 'config',
        value: {
          baseURL: `${config.simalandApiUrl}/api/v3`,
          adapter,
        },
      },
      {
        enhancer: 'axiosEnhancer',
      },
    ],
  },
  {
    name: 'headers',
    factory: prepareRequestHeaders,
    dependencies: [
      'config',
      'request',
    ],
  },
  {
    name: 'axiosEnhancer',
    singleton: enhancerConstructor,
    dependencies: [
      {
        name: 'constructors',
        value: [
          createStagesTraceRequestMiddleware, // Должен быть в списке middleware перед createTraceRequestMiddleware
          createTraceRequestMiddleware,
          createPassHeadersMiddleware,
          createCollectCookieMiddleware,
          createCountApiResponseTimeMiddleware,
          createSetHttpAgentsMiddleware,

          /**
           * Должен быть перед createHandleExceptionMiddleware.
           * Возьмет данные ошибки и прокинет её в следующий обработчик.
           * Не нужен на сервере, там крошки собираются глобальной интеграцией.
           */
          createAttachBreadcrumbsMiddleware,
          createHandleExceptionMiddleware,
        ],
      },
      'context',
      { tracer: 'jaegerTracer' },
      'timeDataKey',
      'request',
      'response',
      'httpAgent',
      'httpsAgent',
      'headers',
      { sentry: 'sentryLogger' },
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
      'request',
    ],
  },
];

export const getHandlerContainer = createFactory({ services, parent: getAppContainer() });

const inject = createInject(getHandlerContainer);

export default inject;
