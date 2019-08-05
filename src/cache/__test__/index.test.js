import {
  createRedisCache,
  reconnectOnError,
  getRetryStrategy,
  getOnConnectCallback,
  getOnReconnectingCallback,
  mapServiceOptionsToArgs,
} from '..';
import { mockSet, mockGet, mockOn } from '../../../__mocks__/ioredis';

describe('createRedisCache()', () => {
  const config = {
    cacheConfig: {
      test: 1,
    },
    redisHost: 'foo',
    redisPort: '8020',
    redisPassword: 'qwerty',
    redisDB: 'DB',
    redisEnabled: false,
    defaultCacheDuration: 300,
    recDelay: 301,
  };
  it('createRedisCache() return Object without config', () => {
    const redis = createRedisCache(
      reconnectOnError,
      getRetryStrategy,
      getOnConnectCallback,
      getOnReconnectingCallback
    );
    expect(mockOn).toHaveBeenCalledTimes(0);
    expect(redis).toEqual({});
  });
  it('createRedisCache() works without callback functions', () => {
    const redis = createRedisCache(config);
    expect(mockOn).toHaveBeenCalledTimes(0);
    expect(redis).toEqual({});
  });
  it('createRedisCache() works if redisEnabled', () => {
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
    const redis = createRedisCache(config,
      reconnectOnError, getRetryStrategy, getOnConnectCallback, getOnReconnectingCallback);
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

describe('mapServiceOptionsToArgs()', () => {
  const config = {
    cacheConfig: 'test',
    redisHost: 'foo',
  };
  it('mapServiceOptionsToArgs() works with just config', () => {
    expect(mapServiceOptionsToArgs({ config })).toEqual([{
      cacheConfig: 'test',
      redisHost: 'foo',
    },
    undefined,
    undefined,
    undefined,
    undefined]);
  });
  it('mapServiceOptionsToArgs() works properly', () => {
    const reconnectAfterError = 't';
    const getRepeatStrategy = 'e';
    const getOnJoinCallback = 's';
    const getAfterReconnectingCallback = 't';
    expect(mapServiceOptionsToArgs({
      config, reconnectAfterError,
      getRepeatStrategy, getOnJoinCallback, getAfterReconnectingCallback,
    })).toEqual([{
      cacheConfig: 'test',
      redisHost: 'foo',
    },
    't',
    'e',
    's',
    't']);
  });
});
