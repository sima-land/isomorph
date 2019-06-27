import { createObserveMiddleware } from '../index.js';

describe('createObserveMiddleware()', () => {
  it('should return function', () => {
    expect(typeof createObserveMiddleware()).toBe('function');
  });
  it('should return middleware that works correctly', () => {
    const testRequest = {};
    const testResponse = { once: jest.fn() };
    const testNext = jest.fn();
    const onStart = jest.fn();
    const onFinish = jest.fn();
    const middleware = createObserveMiddleware({
      onStart,
      onFinish,
    });
    const testStartTime = [100, 2000000];
    const testDuration = [200, 2000000];

    jest.spyOn(process, 'hrtime')
      .mockReturnValueOnce(testStartTime)
      .mockReturnValueOnce(testDuration);

    expect(onStart).toHaveBeenCalledTimes(0);
    expect(onFinish).toHaveBeenCalledTimes(0);
    expect(testResponse.once).toHaveBeenCalledTimes(0);

    middleware(testRequest, testResponse, testNext);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledTimes(0);
    expect(onStart).toHaveBeenCalledWith(100002, testRequest, testResponse);
    expect(testResponse.once).toHaveBeenCalledTimes(1);
    expect(testResponse.once.mock.calls[0][0]).toBe('finish');

    const responseCallback = testResponse.once.mock.calls[0][1];
    responseCallback();
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledWith(200002, testRequest, testResponse);
  });
  it('should works when "onStart" or/and "onFinish" is missed', () => {
    const middleware = createObserveMiddleware({
      onStart: null,
      onFinish: undefined,
    });
    const testRequest = {};
    const testResponse = { once: jest.fn() };
    expect(() => middleware(testRequest, testResponse, () => {})).not.toThrow();
    expect(testResponse.once).toBeCalledTimes(0);
  });
});
