import { getTracer, traceIncomingRequest, createTracingMiddleware } from '..';
import { initTracerFromEnv, tracer } from '../../../__mocks__/jaeger-client';
import { FORMAT_HTTP_HEADERS } from 'opentracing';
import { createObserveMiddleware } from '../../observe-middleware/';

jest.mock('../../observe-middleware/', () => {
  const original = jest.requireActual('../../observe-middleware/');
  return {
    ...original,
    __esModule: true,
    createObserveMiddleware: jest.fn(original.createObserveMiddleware),
  };
});

describe('getTracer()', () => {
  let instance;
  const config = {};
  const metrics = {};
  const logger = {};
  it('at first time creates tracer instance', () => {
    instance = getTracer({ config, metrics, logger });
    expect(initTracerFromEnv).toHaveBeenCalledTimes(1);
    expect(instance).toEqual(tracer);
  });
  it('returns same tracer instance', () => {
    const sameInstance = getTracer({ config, metrics, logger });
    expect(initTracerFromEnv).toHaveBeenCalledTimes(1);
    expect(sameInstance).toEqual(tracer);
  });
});

describe('traceIncomingRequest()', () => {
  it('traceIncomingRequest() calls method tracer.startSpan', () => {
    const httpRequest = { headers: 1 };
    traceIncomingRequest(tracer, 'key', httpRequest);
    expect(tracer.startSpan).toHaveBeenCalledTimes(1);
    expect(tracer.startSpan).toHaveBeenCalledWith('key', {});
    expect(tracer.extract).toHaveBeenCalledTimes(1);
    expect(tracer.extract).toHaveBeenCalledWith(FORMAT_HTTP_HEADERS, 1);
  });
});

describe('createTracingMiddleware()', () => {
  it('should return result of createObserveMiddleware call', () => {
    const testValue = Symbol('test');
    createObserveMiddleware.mockReturnValue(testValue);
    expect(createObserveMiddleware).toHaveBeenCalledTimes(0);
    expect(createTracingMiddleware()).toBe(testValue);
    expect(createObserveMiddleware).toHaveBeenCalledTimes(1);
  });
  it('should call createObserveMiddleware correctly', () => {
    createTracingMiddleware();
    expect(typeof createObserveMiddleware.mock.calls[0][0].onStart).toBe('function');
    expect(typeof createObserveMiddleware.mock.calls[0][0].onFinish).toBe('function');
  });
  it('should pass properly worked functions to createObserveMiddleware', () => {
    const testSpan = { testSpan: true };
    const spanCreator = jest.fn(() => testSpan);
    const spanFinishHandler = jest.fn();
    createTracingMiddleware(spanCreator, spanFinishHandler);
    const requestStartHandler = createObserveMiddleware.mock.calls[0][0].onStart;
    const requestFinishHandler = createObserveMiddleware.mock.calls[0][0].onFinish;

    const testRequest = {};
    const testResponse = { locals: {} };

    expect(spanCreator).toHaveBeenCalledTimes(0);
    requestStartHandler(0, testRequest, testResponse);
    expect(spanCreator).toHaveBeenCalledTimes(1);
    expect(spanCreator).toHaveBeenCalledWith(testRequest, testResponse);

    expect(spanFinishHandler).toHaveBeenCalledTimes(0);
    requestFinishHandler(0, testRequest, testResponse);
    expect(spanFinishHandler).toHaveBeenCalledTimes(1);
    expect(spanFinishHandler).toHaveBeenCalledWith(testRequest, testResponse, testSpan);
  });
  it('should handle options argument', () => {
    const testSpan = { testSpan: true };
    const spanCreator = jest.fn(() => testSpan);
    const spanFinishHandler = jest.fn();
    createTracingMiddleware(spanCreator, spanFinishHandler, {
      spanKey: 'testSpanKey',
    });
    const requestStartHandler = createObserveMiddleware.mock.calls[0][0].onStart;

    const testRequest = {};
    const testResponse = { locals: {} };

    requestStartHandler(0, testRequest, testResponse);
    expect(testResponse.locals.testSpanKey).toBe(testSpan);
  });
  it('should create handlers that works without arguments', () => {
    createTracingMiddleware();
    const requestStartHandler = createObserveMiddleware.mock.calls[0][0].onStart;
    const requestFinishHandler = createObserveMiddleware.mock.calls[0][0].onFinish;

    expect(requestStartHandler).not.toThrow();
    expect(requestFinishHandler).not.toThrow();
  });
});
