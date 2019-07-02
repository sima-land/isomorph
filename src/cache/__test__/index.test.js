import redisCache,
{ reconnectOnError, getRetryStrategy, getOnConnectCallback, getOnReconnectingCallback } from '..';
import { mockSet, mockGet, mockOn } from '../../../__mocks__/ioredis';

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
    const redis = redisCache({ config },
      reconnectOnError, getRetryStrategy, getOnConnectCallback, getOnReconnectingCallback);
    expect(mockOn).toHaveBeenCalledTimes(0);
    expect(redis).toEqual({});
  });

  it('redisCache() return Object without config', () => {
    const redis = redisCache({}, reconnectOnError, getRetryStrategy, getOnConnectCallback, getOnReconnectingCallback);
    expect(mockOn).toHaveBeenCalledTimes(0);
    expect(redis).toEqual({});
  });

  it('redisCache() works if redisEnabled', () => {
    const config = {
      redisEnabled: true,
      defaultCacheDuration: 300,
      recDelay: 301,
    };

    /**
     * Мок функции-обработчика события повторного соединения с redis.
     */
    const onConnect = () => {};

    /**
     * Мок функции-обработчика события повторного соединения с redis.
     */
    const onReconnect = () => {};
    const getOnConnectCallback = jest.fn(() => onConnect);
    const getOnReconnectingCallback = jest.fn(() => onReconnect);
    const redis = redisCache({ config,
      reconnectOnError, getRetryStrategy, getOnConnectCallback, getOnReconnectingCallback });
    expect(mockOn).toHaveBeenCalledTimes(2);
    expect(mockOn.mock.calls[0][0]).toEqual('connect');
    expect(mockOn.mock.calls[0][1]).toEqual(onConnect);
    expect(mockOn.mock.calls[1][0]).toEqual('reconnecting');
    expect(mockOn.mock.calls[1][1]).toEqual(onReconnect);
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

describe('reconnectOnError()', () => {
  it('reconnectOnError() works properly', () => {
    let code = 'properly';
    expect(reconnectOnError({ code })).toBeFalsy();
    code = 'ECONNREFUSED';
    expect(reconnectOnError({ code })).toBeTruthy();
  });
});

describe('retryStrategyDelay()', () => {
  it('retryStrategyDelay() works properly', () => {
    const delay = getRetryStrategy(999)();
    expect(delay).toEqual(999);
  });
});

describe('getOnConnectCallback()', () => {
  it('getOnConnectCallback() works properly', () => {
    const cache = {};
    getOnConnectCallback(cache)();
    expect(cache.status).toBeTruthy();
  });
});

describe('getOnReconnectingCallback()', () => {
  it('getOnReconnectingCallback() works properly', () => {
    const cache = {};
    getOnReconnectingCallback(cache)();
    expect(cache.status).toBeFalsy();
  });
});
