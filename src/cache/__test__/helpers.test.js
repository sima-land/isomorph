import {
  getOnConnectCallback,
  getOnReconnectingCallback,
  reconnectOnError,
  keyInLocalStorageExists,
} from '../helpers';

import localStorageCache from '../local-storage';

describe('reconnectOnError()', () => {
  it('reconnectOnError() works properly', () => {
    let code = 'properly';
    expect(reconnectOnError({ code })).toBeFalsy();
    code = 'ECONNREFUSED';
    expect(reconnectOnError({ code })).toBeTruthy();
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

describe('keyInLocalStorageExists', () => {
  it('return true/false correctly', () => {
    localStorageCache.set('test', 'testString');
    expect(keyInLocalStorageExists('test')).toBeTruthy();
    expect(keyInLocalStorageExists('nonexistentKey')).toBeFalsy();
  });
});
