import { createChildTracingMiddleware } from '../create-child-tracing-middleware';
import {
  createObserveMiddleware,
  defaultStartSubscriber,
  defaultFinishSubscriber,
} from '../../../observe-middleware';
import { tracer, testSpan } from '../../../../__mocks__/jaeger-client';

jest.mock('../../../observe-middleware', () => {
  const original = jest.requireActual('../../../observe-middleware');
  return {
    ...original,
    __esModule: true,
    createObserveMiddleware: jest.fn(original.createObserveMiddleware),
  };
});

describe('createChildTracingMiddleware', () => {
  const spanName = 'test';
  const dependencies = {
    tracer,
    spanName,
    startSubscriber: jest.fn(defaultStartSubscriber),
    finishSubscriber: jest.fn(defaultFinishSubscriber),
  };

  it('should throw error if spanName not a string', () => {
    expect(() => createChildTracingMiddleware({
      ...dependencies,
      spanName: 123,
    })).toThrow(TypeError('"spanName" properties must be a string'));
  });

  it('should return result of createObserveMiddleware()', () => {
    expect(createObserveMiddleware).toHaveBeenCalledTimes(0);
    const middleware = createChildTracingMiddleware(dependencies);
    expect(typeof middleware).toBe('function');
    expect(createObserveMiddleware).toHaveBeenCalledTimes(1);
    expect(typeof createObserveMiddleware.mock.calls[0][0].onStart).toBe('function');
    expect(typeof createObserveMiddleware.mock.calls[0][0].onFinish).toBe('function');
  });

  it(
    'should pass callbacks to createObserveMiddleware that calls startSpan(), setTag() and finish()',
    () => {
      jest.spyOn(process, 'hrtime').mockReturnValue([100, 2000000]);

      const middleware = createChildTracingMiddleware(dependencies);
      const eventHandlers = [];
      const locals = { span: jest.fn() };
      const testRequest = { testRequest: true };
      const testResponse = {
        testResponse: true,
        locals,
        once: (event, eventHandler) => eventHandlers.push(eventHandler),
      };

      expect(tracer.startSpan).toHaveBeenCalledTimes(0);
      expect(testResponse.locals[spanName]).toBeUndefined();
      expect(dependencies.startSubscriber).not.toHaveBeenCalled();
      expect(dependencies.finishSubscriber).not.toHaveBeenCalled();

      // run middleware
      middleware(testRequest, testResponse, () => {});
      expect(dependencies.startSubscriber).toHaveBeenCalledWith(
        {
          callback: expect.any(Function),
          request: testRequest,
          response: testResponse,
        }
      );
      expect(dependencies.finishSubscriber).toHaveBeenCalledWith(
        {
          callback: expect.any(Function),
          request: testRequest,
          response: testResponse,
        }
      );
      expect(tracer.startSpan).toHaveBeenCalledTimes(1);
      expect(tracer.startSpan).toHaveBeenCalledWith(spanName, { childOf: locals.span });
      expect(testResponse.locals[spanName]).toEqual(testSpan);

      // emit finish event
      eventHandlers.forEach(handler => handler());
      expect(testSpan.setTag).toHaveBeenCalledTimes(1);
      expect(testSpan.setTag).toHaveBeenCalledWith(`${spanName} duration`, '100002 ms');
      expect(testSpan.finish).toHaveBeenCalledTimes(1);
    }
  );
});
