import {
  getTracer,
  traceIncomingRequest,
  _createTracingMiddleware,
  getSpanContext,
  _deptToArg,
  _getRequestContext,
  createSpanCreator,
  spanFinishHandler,
} from '..';
import { initTracerFromEnv, tracer, testSpan } from '../../../../__mocks__/jaeger-client';
import { FORMAT_HTTP_HEADERS } from 'opentracing';
import { createObserveMiddleware } from '../../../observe-middleware/';

jest.mock('../../../observe-middleware/', () => {
  const original = jest.requireActual('../../../observe-middleware/');
  return {
    ...original,
    __esModule: true,
    createObserveMiddleware: jest.fn(original.createObserveMiddleware),
  };
});

describe('getTracer()', () => {
  let instance;
  const tracerConfig = {
    serviceName: 'hello world',
    version: 'test',
  };
  it('at first time creates tracer instance', () => {
    instance = getTracer({ tracerConfig });
    expect(initTracerFromEnv).toHaveBeenCalledWith(
      { serviceName: 'hello world' },
      { tags: { ['hello world.version']: 'test' } }
    );
    expect(instance).toEqual(tracer);
  });
  it('returns same tracer instance', () => {
    const sameInstance = getTracer({ tracerConfig });
    expect(initTracerFromEnv).toHaveBeenCalledTimes(1);
    expect(sameInstance).toEqual(tracer);
  });
});

describe('traceIncomingRequest()', () => {
  const httpRequest = { headers: 1 };
  it('should calls method tracer.startSpan', () => {
    traceIncomingRequest(tracer, 'key', httpRequest);
    expect(tracer.startSpan).toHaveBeenCalledTimes(1);
    expect(tracer.startSpan).toHaveBeenCalledWith('key', {});
    expect(tracer.extract).toHaveBeenCalledTimes(1);
    expect(tracer.extract).toHaveBeenCalledWith(FORMAT_HTTP_HEADERS, 1);
  });

  it('should calls span.addTags method with payload', () => {
    traceIncomingRequest(tracer, 'key', httpRequest, { test: 'test' });
    expect(testSpan.addTags).toBeCalledWith({ test: 'test' });
  });
  it('should calls span.addTags method with empty object', () => {
    traceIncomingRequest(tracer, 'key', httpRequest);
    traceIncomingRequest(tracer, 'key', httpRequest, 'badPayload');
    expect(testSpan.addTags).toHaveBeenNthCalledWith(1, {});
    expect(testSpan.addTags).toHaveBeenNthCalledWith(2, {});
  });
});

describe('_createTracingMiddleware()', () => {
  it('should return result of createObserveMiddleware call', () => {
    const testValue = Symbol('test');
    createObserveMiddleware.mockReturnValue(testValue);
    expect(createObserveMiddleware).toHaveBeenCalledTimes(0);
    expect(_createTracingMiddleware()).toBe(testValue);
    expect(createObserveMiddleware).toHaveBeenCalledTimes(1);
  });
  it('should call createObserveMiddleware correctly', () => {
    _createTracingMiddleware();
    expect(typeof createObserveMiddleware.mock.calls[0][0].onStart).toBe('function');
    expect(typeof createObserveMiddleware.mock.calls[0][0].onFinish).toBe('function');
  });
  it('should pass properly worked functions to createObserveMiddleware', () => {
    const spanCreator = jest.fn(() => testSpan);
    const finishHandler = jest.fn();
    _createTracingMiddleware(spanCreator, finishHandler);
    const requestStartHandler = createObserveMiddleware.mock.calls[0][0].onStart;
    const requestFinishHandler = createObserveMiddleware.mock.calls[0][0].onFinish;

    const testRequest = {};
    const testResponse = { locals: {} };

    expect(spanCreator).toHaveBeenCalledTimes(0);
    requestStartHandler(0, testRequest, testResponse);
    expect(spanCreator).toHaveBeenCalledTimes(1);
    expect(spanCreator).toHaveBeenCalledWith(testRequest, testResponse);

    expect(finishHandler).toHaveBeenCalledTimes(0);
    requestFinishHandler(0, testRequest, testResponse);
    expect(finishHandler).toHaveBeenCalledTimes(1);
    expect(finishHandler).toHaveBeenCalledWith(testRequest, testResponse, testSpan);
  });
  it('should handle options argument', () => {
    const spanCreator = jest.fn(() => testSpan);
    const finishHandler = jest.fn();
    _createTracingMiddleware(spanCreator, finishHandler, {
      spanKey: 'testSpanKey',
    });
    const requestStartHandler = createObserveMiddleware.mock.calls[0][0].onStart;

    const testRequest = {};
    const testResponse = { locals: {} };

    requestStartHandler(0, testRequest, testResponse);
    expect(testResponse.locals.testSpanKey).toBe(testSpan);
  });
  it('should create handlers that works without arguments', () => {
    _createTracingMiddleware();
    const requestStartHandler = createObserveMiddleware.mock.calls[0][0].onStart;
    const requestFinishHandler = createObserveMiddleware.mock.calls[0][0].onFinish;

    expect(requestStartHandler).not.toThrow();
    expect(requestFinishHandler).not.toThrow();
  });
});

describe('getSpanContext', () => {
  it ('should return null if context empty', () => {
    const response = {
      locals: {
        span: {
          context: () => {},
        },
      },
    };
    const context = getSpanContext({ response });
    expect(context).toBe(null);
  });

  it ('should return null if context not is function', () => {
    const response = {
      locals: {
        span: {
          context: 'I am not is function',
        },
      },
    };
    const context = getSpanContext({ response });
    expect(context).toBe(null);
  });

  it ('should return context if there answer', () => {
    const response = {
      locals: {
        span: {
          context: () => ({ test: true }),
        },
      },
    };
    const context = getSpanContext({ response });
    expect(context).toEqual({ test: true });
  });
  it ('should return null if not span', () => {
    const response = {
      locals: {
      },
    };
    const context = getSpanContext({ response });
    expect(context).toBe(null);
  });
});

describe('_deptToArg()', () => {
  it('should work correctly', () => {
    const dept = { createSpan: 'createSpan', onSpanFinish: 'onSpanFinish', options: {} };
    expect(_deptToArg(dept)).toEqual(['createSpan', 'onSpanFinish', {}]);
  });
});

describe('_getRequestContext()', () => {
  const request = {
    originalUrl: '/foo',
    headers: {
      'Simaland-Params': 'test',
    },

    /**
     * Возвращает содержимое заголовка.
     * @param {string} propName Имя заголовка.
     * @return {string} Содержимое.
     */
    get (propName) {
      return this.headers[propName];
    },
  };

  it('should return correct context', () => {
    expect(_getRequestContext(request, { test: 'test', redisPassword: 'secret' })).toEqual({
      'request.path': '/foo',
      'request.headers.Simaland-Params': 'test',
      'app.config': {
        test: 'test',
        redisPassword: '[Filtered]',
      },
    });
  });

  it('should return correct context if config not object', () => {
    expect(_getRequestContext(request)).toEqual({
      'request.path': '/foo',
      'request.headers.Simaland-Params': 'test',
      'app.config': '',
    });

    expect(_getRequestContext(request, 'bad config')).toEqual({
      'request.path': '/foo',
      'request.headers.Simaland-Params': 'test',
      'app.config': '',
    });
  });

  it('should return correct context if Simaland-Params headers not defined', () => {
    expect(_getRequestContext({ ...request, headers: {} }, { test: 'test' })).toEqual({
      'request.path': '/foo',
      'request.headers.Simaland-Params': '',
      'app.config': { test: 'test' },
    });
  });

  it('should return correct context if get method not a function', () => {
    expect(_getRequestContext({ ...request, get: null }, { test: 'test' })).toEqual({
      'request.path': '/foo',
      'request.headers.Simaland-Params': '',
      'app.config': { test: 'test' },
    });
  });
});

describe('createSpanCreator()', () => {
  const instance = createSpanCreator({ jaegerTracer: tracer, config: { test: 'test' } });
  it('should create function', () => {
    expect(instance).toBeInstanceOf(Function);
    expect(instance).toHaveLength(1);
  });

  describe('instance', () => {
    const request = { headers: 1, originalUrl: '/test' };
    it('should calls method tracer.startSpan', () => {
      instance(request);
      expect(tracer.startSpan).toHaveBeenCalledTimes(1);
      expect(tracer.startSpan).toHaveBeenCalledWith('incoming-http-request', {});
      expect(tracer.extract).toHaveBeenCalledTimes(1);
      expect(tracer.extract).toHaveBeenCalledWith(FORMAT_HTTP_HEADERS, 1);
      expect(testSpan.addTags).toBeCalledWith({
        'app.config': { test: 'test' },
        'request.headers.Simaland-Params': '',
        'request.path': '/test',
      });
    });
  });
});

describe('spanFinishHandler', () => {
  it('handles finish correctly', () => {
    const span = { finish: jest.fn() };
    spanFinishHandler({}, {}, span);
  });
});
