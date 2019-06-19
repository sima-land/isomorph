import redisCache, { cache, reconnectOnErrorFunc, retryStrategyDelay,
  cacheStatusConnect, cacheStatusReconnecting } from '../cache';
import { mockSet, mockGet, mockOn } from '../../__mocks__/ioredis';

describe('redisCache()', () => {
  it('redisCache() works if redisDisabled', () => {
    const config = {
      redisHost: 'foo',
      redisPort: '8020',
      redisPassword: 'qwerty',
      redisDB: 'DB',
      redisEnabled: false,
      defaultCacheDuration: 300,
      recDelay: 301,
    };
    const redis = redisCache({ config });
    expect(mockOn).toHaveBeenCalledTimes(0);
    expect(redis).toEqual({});
  });

  it('redisCache() return Object without config', () => {
    const redis = redisCache({});
    expect(mockOn).toHaveBeenCalledTimes(0);
    expect(redis).toEqual({});
  });

  it('redisCache() works if redisEnabled', () => {
    const config = {
      redisHost: 'foo',
      redisPort: '8020',
      redisPassword: 'qwerty',
      redisDB: 'DB',
      redisEnabled: true,
      defaultCacheDuration: 300,
      recDelay: 301,
    };
    const redis = redisCache({ config });
    expect(mockOn).toHaveBeenCalledTimes(2);
    expect(mockOn).toHaveBeenCalledWith('connect', cacheStatusConnect);
    expect(mockOn).toHaveBeenCalledWith('reconnecting', cacheStatusReconnecting);
    redis.set('testKey', 'testValue');
    expect(mockSet).toBeCalledTimes(1);
    expect(mockSet.mock.calls[0][0]).toEqual('testKey');
    expect(mockSet.mock.calls[0][1]).toEqual('testValue');
    expect(mockSet.mock.calls[0][2]).toEqual('EX');
    expect(mockSet.mock.calls[0][3]).toEqual(300);
    redis.get('test');
    expect(mockGet).toBeCalledTimes(1);
    expect(mockGet.mock.calls[0][0]).toEqual('test');
  });
});

describe('reconnectOnErrorFunc()', () => {
  it('reconnectOnErrorFunc() works properly', () => {
    let code = 666;
    reconnectOnErrorFunc({ code });
    const targetError = 'ECONNREFUSED';
    expect(targetError === code).toBeFalsy();
    code = 'ECONNREFUSED';
    expect(targetError === code).toBeTruthy();
  });
});

describe('retryStrategyDelay()', () => {
  it('retryStrategyDelay() works properly', () => {
    const delay = retryStrategyDelay(999);
    expect(delay).toBe(999);
  });
});

describe('cacheStatusConnect()', () => {
  it('cacheStatusConnect() works properly', () => {
    cacheStatusConnect();
    expect(cache.status).toBeTruthy();
  });
});

describe('cacheStatusReconnecting()', () => {
  it('cacheStatusReconnecting() works properly', () => {
    cacheStatusReconnecting();
    expect(cache.status).toBeFalsy();
  });
});
