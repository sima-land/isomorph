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
import createPassHeadersMiddleware from '../../../../src/helpers/api/middlewares/pass-headers-middleware';
import createCollectCookieMiddleware from '../../../../src/helpers/api/middlewares/collect-cookie-middleware';
import createCountApiResponseTimeMiddleware from '../../../../src/helpers/api/middlewares/count-api-response-time';
import { getXClientIp } from '../../../../src/helpers/http/request-getters';
import getParams, { parseHttpHeaders } from '../../../../src/helpers/get-params';
import createInject from '../../../../src/container/create-inject';
import adapter from '../../../../src/helpers/api/server-adapter';
import createStagesTraceRequestMiddleware from '../../../../src/helpers/api/middlewares/stages-trace-middleware';

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
    ],
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
    name: 'ip',
    factory: getXClientIp,
    dependencies: [
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
        ],
      },
      'context',
      'ip',
      'serviceUserAgent',
      { tracer: 'jaegerTracer' },
      'timeDataKey',
      'request',
      'response',
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
