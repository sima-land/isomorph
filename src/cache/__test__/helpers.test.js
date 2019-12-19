import {
  getOnConnectCallback,
  getOnReconnectingCallback,
  getRetryStrategy,
  reconnectOnError,
} from '../helpers';

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
