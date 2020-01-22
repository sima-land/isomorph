import {
  createRedisCache,
  mapServiceOptionsToArgs,
} from '../redis';
import { promisify } from 'util';
import {
  reconnectOnError,
  getOnConnectCallback,
  getOnReconnectingCallback,
} from '../helpers';
import Redis, {
  mockSet,
  mockGet,
  mockOn,
} from '../../../__mocks__/ioredis';

jest.mock('util', () => {
  const original = jest.requireActual('util');
  return {
    ...original,
    __esModule: true,
    promisify: jest.fn(original.promisify),
  };
});

jest.mock('../helpers', () => {
  const original = jest.requireActual('../helpers');
  return {
    ...original,
    __esModule: true,
    getOnConnectCallback: jest.fn(original.getOnConnectCallback),
    getOnReconnectingCallback: jest.fn(original.getOnReconnectingCallback),
    getRetryStrategy: jest.fn(original.getRetryStrategy),
  };
});

describe('createRedisCache()', () => {
  const config = {
    cacheConfig: {
      test: 1,
    },
    redisHost: 'foo',
    redisPort: '8020',
    redisPassword: 'qwerty',
    redisDB: 'DB',
    redisEnabled: true,
    defaultCacheDuration: 300,
    recDelay: 301,
  };

  it('should return an object when called without config', () => {
    const cache = createRedisCache();

    expect(Redis).toHaveBeenCalledTimes(0);
    expect(mockOn).toHaveBeenCalledTimes(0);
    expect(cache).toEqual({
      status: null,
    });
  });

  it('should work if redis and sentinel are disabled', () => {
    const cache = createRedisCache({
      redisEnabled: false,
      sentinelEnabled: false,
    });

    expect(Redis).toHaveBeenCalledTimes(0);
    expect(mockOn).toHaveBeenCalledTimes(0);
    expect(cache).toEqual({
      status: null,
    });
  });

  it('should work with default handlers', () => {
    const cache = createRedisCache(config);
    const onConnect = getOnConnectCallback.mock.results[0].value;
    const onReconnect = getOnReconnectingCallback.mock.results[0].value;

    expect(Redis).toBeCalledTimes(1);
    expect(Redis).toBeCalledWith({
      reconnectOnError,
      retryStrategy: undefined,
      test: 1,
    });

    expect(mockOn).toHaveBeenNthCalledWith(
      1,
      'connect',
      onConnect
    );

    expect(mockOn).toHaveBeenNthCalledWith(
      2,
      'reconnecting',
      onReconnect
    );

    expect(cache.status).toBe(null);
    expect(cache.get).toBeInstanceOf(Function);
    expect(cache.set).toBeInstanceOf(Function);
  });

  it('should work with custom handlers', () => {
    const onConnect = jest.fn();
    const onReconnect = jest.fn();
    const retryStrategy = jest.fn();
    const reconnectAfterError = jest.fn();
    const getRepeatStrategy = jest.fn(() => retryStrategy);
    const getOnJoinCallback = jest.fn(() => onConnect);
    const getAfterReconnectingCallback = jest.fn(() => onReconnect);

    const cache = createRedisCache(
      config,
      reconnectAfterError,
      getRepeatStrategy,
      getOnJoinCallback,
      getAfterReconnectingCallback
    );

    expect(Redis).toBeCalledTimes(1);
    expect(Redis).toBeCalledWith({
      reconnectOnError: reconnectAfterError,
      retryStrategy,
      test: 1,
    });

    expect(mockOn).toHaveBeenNthCalledWith(
      1,
      'connect',
      onConnect
    );

    expect(mockOn).toHaveBeenNthCalledWith(
      2,
      'reconnecting',
      onReconnect
    );

    expect(cache.status).toBe(null);
    expect(cache.get).toBeInstanceOf(Function);
    expect(cache.set).toBeInstanceOf(Function);
  });

  it('should change status on connect and reconnect', () => {
    const cache = createRedisCache(config);
    const onConnect = getOnConnectCallback.mock.results[0].value;
    const onReconnect = getOnReconnectingCallback.mock.results[0].value;

    expect(cache.status).toBe(null);

    onConnect();
    expect(cache.status).toBe(true);

    onReconnect();
    expect(cache.status).toBe(false);
  });

  it('should use get function on redis', () => {
    const cache = createRedisCache(config);

    cache.get('test');
    expect(mockGet).toBeCalledTimes(1);
    expect(mockGet.mock.calls[0][0]).toBe('test');
    expect(promisify).toBeCalledTimes(1);
    expect(promisify).toBeCalledWith(mockGet);
  });

  it('should use set function on redis with default duration', () => {
    const cache = createRedisCache(config);

    cache.set('test', 'something');
    expect(mockSet).toBeCalledTimes(1);
    expect(mockSet).toBeCalledWith(
      'test',
      'something',
      'EX',
      300
    );
  });

  it('should use set function on redis with custom duration', () => {
    const cache = createRedisCache(config);

    cache.set('test', 'something', 3600);
    expect(mockSet).toBeCalledTimes(1);
    expect(mockSet).toBeCalledWith(
      'test',
      'something',
      'EX',
      3600
    );
  });

  it('should work with sentinel', () => {
    const cache = createRedisCache({
      ...config,
      redisEnabled: false,
      sentinelEnabled: true,
      sentinelConfig: {
        some: 'thing',
      },
    });

    const onConnect = getOnConnectCallback.mock.results[0].value;
    const onReconnect = getOnReconnectingCallback.mock.results[0].value;

    expect(Redis).toBeCalledTimes(1);
    expect(Redis).toBeCalledWith({
      some: 'thing',
    });

    expect(mockOn).toHaveBeenNthCalledWith(
      1,
      'connect',
      onConnect
    );

    expect(mockOn).toHaveBeenNthCalledWith(
      2,
      'reconnecting',
      onReconnect
    );

    expect(cache.status).toBe(null);
    expect(cache.get).toBeInstanceOf(Function);
    expect(cache.set).toBeInstanceOf(Function);
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
