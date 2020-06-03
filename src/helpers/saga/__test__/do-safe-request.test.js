import { call } from 'redux-saga/effects';
import sentryLogger from '../../../../__mocks__/sentry';
import { data, error, errorWithConfig, errorWithResponse } from '../__fixtures__/do-safe-request';
import doSafeRequest from '../do-safe-request';

const requestFn = jest.fn();

describe('common saga doSafeRequest', () => {
  it('should use default options', () => {
    const gen = doSafeRequest(requestFn);
    expect(gen.next().value).toEqual(call(requestFn));
    expect(gen.next().done).toBe(true);
  });
  it('catches error', () => {
    const gen = doSafeRequest(requestFn, {
      captureException: sentryLogger.captureException,
    });
    expect(gen.next().value).toEqual(call(requestFn));
    const { done, value } = gen.throw(error);
    expect(done).toBeTruthy();
    expect(value).toEqual({
      error: {
        message: 'Error message',
      },
      data: null,
      ok: false,
      status: null,
    });
    expect(sentryLogger.captureException).toHaveBeenCalledWith(error);
  });
  it('catches error and return correct error message if error has config', () => {
    const gen = doSafeRequest(requestFn, {
      captureException: sentryLogger.captureException,
    });
    expect(gen.next().value).toEqual(call(requestFn));
    const { done, value } = gen.throw(errorWithConfig);
    expect(done).toBeTruthy();
    expect(sentryLogger.captureException).toHaveBeenCalledWith(errorWithConfig);
    expect(value).toEqual({
      data: null,
      error: {
        config: {
          url: 'test-error-url',
        },
        message: 'Error message',
      },
      ok: false,
      status: null,
    });
  });
  it('successfully requests data and generate response', () => {
    const gen = doSafeRequest(requestFn, {
      args: [1, 2, 3],
    });
    expect(gen.next().value).toEqual(call(requestFn, 1, 2, 3));
    const { done, value } = gen.next({
      status: 200,
      data,
    });
    expect(value).toEqual({
      data,
      status: 200,
      ok: true,
      error: null,
    });
    expect(value.else).toBeUndefined();
    expect(done).toBeTruthy();
  });
  it('should handle "captureException" option', () => {
    const testRequestFunction = jest.fn();
    const testCaptureException = jest.fn();
    const gen = doSafeRequest(testRequestFunction, {
      args: ['hello'],
      captureException: testCaptureException,
    });
    expect(gen.next().value).toEqual(call(testRequestFunction, 'hello'));
    expect(testCaptureException).toHaveBeenCalledTimes(0);
    const { done } = gen.throw(error);
    expect(testCaptureException).toHaveBeenCalledTimes(1);
    expect(testCaptureException).toHaveBeenCalledWith(error);
    expect(done).toBe(true);
  });
  it('should works correctly if "captureException" option is not passed', () => {
    const testRequestFunction = jest.fn();
    const gen = doSafeRequest(testRequestFunction, {
      args: ['hello'],
    });
    expect(gen.next().value).toEqual(call(testRequestFunction, 'hello'));
    const { done, value } = gen.throw(errorWithResponse);
    expect(done).toBe(true);
    expect(value).toEqual({
      data: errorWithResponse.response.data,
      error: errorWithResponse,
      ok: false,
      status: errorWithResponse.response.status,
    });
  });
  it('should not call "captureException" when response is successful', () => {
    const testResponse = {
      status: 201,
      data: 345,
    };
    const testRequestFunction = jest.fn(() => testResponse);
    const testCaptureException = jest.fn();
    const gen = doSafeRequest(testRequestFunction, {
      args: ['hello'],
      captureException: testCaptureException,
    });
    expect(gen.next().value).toEqual(call(testRequestFunction, 'hello'));

    gen.next(testResponse);
    expect(testCaptureException).toHaveBeenCalledTimes(0);
    expect(gen.next().done).toBe(true);
  });
});
