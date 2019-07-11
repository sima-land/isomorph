import { createObserveMiddleware, defaultFinishSubscriber } from '../index.js';
import { defaultStartSubscriber } from '../index';

describe('createObserveMiddleware()', () => {
  const onStart = jest.fn();
  const onFinish = jest.fn();
  const testRequest = {};
  const testResponse = { once: jest.fn() };
  const testFirstStartTime = [100, 2000000];
  const testSecondStartTime = [150, 2000001];
  const testDuration = [200, 2000000];
  const startSubscriber = jest.fn(defaultStartSubscriber);
  const finishSubscriber = jest.fn(defaultFinishSubscriber);
  it('should return function', () => {
    expect(typeof createObserveMiddleware()).toBe('function');
  });
  it('should return middleware that works correctly', () => {
    const testNext = jest.fn();
    const middleware = createObserveMiddleware({
      onStart,
      onFinish,
    });
    jest.spyOn(process, 'hrtime')
      .mockReturnValueOnce(testFirstStartTime)
      .mockReturnValueOnce(testSecondStartTime)
      .mockReturnValueOnce(testDuration);

    expect(onStart).toHaveBeenCalledTimes(0);
    expect(onFinish).toHaveBeenCalledTimes(0);
    expect(testResponse.once).toHaveBeenCalledTimes(0);

    middleware(testRequest, testResponse, testNext);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledTimes(0);
    expect(onStart).toHaveBeenCalledWith(150002, testRequest, testResponse);
    expect(testResponse.once).toHaveBeenCalledTimes(1);
    expect(testResponse.once.mock.calls[0][0]).toBe('finish');

    const responseCallback = testResponse.once.mock.calls[0][1];
    responseCallback();
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledWith(200002, testRequest, testResponse);
  });
  it('should work when "onStart" or/and "onFinish" is missed', () => {
    const middleware = createObserveMiddleware({
      onStart: null,
      onFinish: undefined,
    });
    jest.spyOn(process, 'hrtime');
    expect(() => middleware(testRequest, testResponse, () => {
    })).not.toThrow();
    expect(testResponse.once).toBeCalledTimes(1);
    const responseCallback = testResponse.once.mock.calls[0][1];
    responseCallback();
    expect(process.hrtime).toHaveBeenCalledTimes(3);
  });
  it('should work when "startSubscriber" is missed', () => {
    const startSubscriber = null;
    jest.spyOn(process, 'hrtime')
      .mockReturnValueOnce(testFirstStartTime)
      .mockReturnValueOnce(testDuration);
    const middleware = createObserveMiddleware({
      onStart,
      onFinish,
      startSubscriber,
      finishSubscriber,
    });
    expect(finishSubscriber).not.toHaveBeenCalled();
    expect(onStart).not.toHaveBeenCalled();
    middleware(
      testRequest,
      testResponse,
      () => {},
    );
    expect(finishSubscriber).toHaveBeenCalledWith({
      request: testRequest,
      response: testResponse,
      callback: expect.any(Function),
    });
    expect(onStart).not.toHaveBeenCalled();
    expect(onFinish).not.toHaveBeenCalled();
    const responseCallback = testResponse.once.mock.calls[0][1];
    responseCallback();
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledWith(200002, testRequest, testResponse);
  });
  it('should work when "finishSubscriber" is missed', () => {
    const finishSubscriber = null;
    jest.spyOn(process, 'hrtime')
      .mockReturnValueOnce(testFirstStartTime)
      .mockReturnValueOnce(testSecondStartTime);
    const middleware = createObserveMiddleware({
      onStart,
      onFinish,
      startSubscriber,
      finishSubscriber,
    });
    expect(startSubscriber).not.toHaveBeenCalled();
    expect(onStart).not.toHaveBeenCalled();
    middleware(
      testRequest,
      testResponse,
      () => {},
    );
    expect(startSubscriber).toHaveBeenCalledWith({
      request: testRequest,
      response: testResponse,
      callback: expect.any(Function),
    });
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledWith(150002, testRequest, testResponse);
    expect(onFinish).not.toHaveBeenCalled();
  });
});
