import { call } from 'redux-saga/effects';
import cacheResult, {
  validateResultDefault,
  validateCacheDefault,
} from '../cache-result';
import doSafeRequest from '../do-safe-request';

describe('cacheResult()', () => {
  it('should return data from cache', () => {
    const cache = {
      get: jest.fn(),
      set: jest.fn(),
      status: true,
    };
    const key = 'test';
    const result = {
      ok: true,
      data: { some: 'data' },
    };
    const args = [1, 2];
    const gen = cacheResult({
      cache,
      key,
      args,
    });

    expect(gen.next().value).toEqual(call(cache.get, key));
    expect(gen.next(result)).toEqual({
      done: true,
      value: result,
    });
  });

  it('should return data from API', () => {
    const cache = {
      get: jest.fn(),
      set: jest.fn(),
      status: true,
    };
    const key = 'test';
    const apiResult = {
      ok: true,
      data: { some: 'data' },
    };
    const args = [1, 2];
    const gen = cacheResult({
      cache,
      key,
      args,
    });

    expect(gen.next().value).toEqual(call(cache.get, key));
    expect(gen.next(null).value).toEqual(call(doSafeRequest, ...args));
    expect(gen.next(apiResult).value).toEqual(call(cache.set, key, apiResult, 3600));
    expect(gen.next()).toEqual({
      done: true,
      value: apiResult,
    });
  });

  it('should work with custom validators and fn', () => {
    const cache = {
      get: jest.fn(),
      set: jest.fn(),
      status: true,
    };
    const key = 'test';
    const apiResult = {
      ok: true,
      data: { some: 'data' },
    };
    const duration = 5000;
    const fn = jest.fn();
    const validateCache = jest.fn(() => false);
    const validateResult = jest.fn(() => true);

    expect(fn).toBeCalledTimes(0);
    expect(validateCache).toBeCalledTimes(0);
    expect(validateResult).toBeCalledTimes(0);

    const gen = cacheResult({
      cache,
      key,
      fn,
      validateCache,
      validateResult,
      duration: 5000,
    });
    expect(gen.next().value).toEqual(call(cache.get, key));
    expect(gen.next(null).value).toEqual(call(fn));
    expect(gen.next(apiResult).value).toEqual(call(cache.set, key, apiResult, duration));
    expect(gen.next()).toEqual({
      done: true,
      value: apiResult,
    });

    expect(validateCache).toBeCalledTimes(1);
    expect(validateCache).toBeCalledWith(null);
    expect(validateResult).toBeCalledTimes(1);
    expect(validateResult).toBeCalledWith(apiResult);
  });

  it('should return data from API when cache is not available', () => {
    const cache = {
      get: jest.fn(),
      set: jest.fn(),
      status: false,
    };
    const key = 'test';
    const apiResult = {
      ok: true,
      data: { some: 'data' },
    };
    const args = [1, 2];
    const gen = cacheResult({
      cache,
      key,
      args,
    });

    expect(gen.next(null).value).toEqual(call(doSafeRequest, ...args));
    expect(gen.next(apiResult)).toEqual({
      done: true,
      value: apiResult,
    });
  });

  it('should return data from API when cache is not passed', () => {
    const key = 'test';
    const apiResult = {
      ok: true,
      data: { some: 'data' },
    };
    const args = [1, 2];
    const gen = cacheResult({
      key,
      args,
    });

    expect(gen.next(null).value).toEqual(call(doSafeRequest, ...args));
    expect(gen.next(apiResult)).toEqual({
      done: true,
      value: apiResult,
    });
  });

  it('should return response with default error if cache and api is not available', () => {
    const cache = {
      get: jest.fn(),
      set: jest.fn(),
      status: false,
    };
    const key = 'test';
    const args = [1, 2];
    const gen = cacheResult({
      cache,
      key,
      args,
      fn: null,
    });

    expect(gen.next()).toEqual({
      done: true,
      value: false,
    });
  });
});

describe('validateResultDefault()', () => {
  it('should return result if response like false', () => {
    expect(validateResultDefault(null)).toBe(false);
    expect(validateResultDefault(false)).toBe(false);
    expect(validateResultDefault(0)).toBe(false);
  });

  it('should return result if response is not object', () => {
    expect(validateResultDefault([])).toBe(false);
    expect(validateResultDefault(1)).toBe(false);
  });

  it('should return "response.ok" as boolean', () => {
    expect(validateResultDefault({ ok: true })).toBe(true);
    expect(validateResultDefault({ ok: false })).toBe(false);
    expect(validateResultDefault({})).toBe(false);
  });
});

describe('validateCacheDefault()', () => {
  it('should validate data', () => {
    expect(validateCacheDefault({})).toBe(true);
    expect(validateCacheDefault(null)).toBe(false);
  });
});
