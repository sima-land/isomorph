import { call } from 'redux-saga/effects';
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
    const gen = doSafeRequest(requestFn);
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
  });
  it('catches error and return correct error message if error has config', () => {
    const gen = doSafeRequest(requestFn);
    expect(gen.next().value).toEqual(call(requestFn));
    const { done, value } = gen.throw(errorWithConfig);
    expect(done).toBeTruthy();
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
  it('catches error and return correct error message if error has response', () => {
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
});
