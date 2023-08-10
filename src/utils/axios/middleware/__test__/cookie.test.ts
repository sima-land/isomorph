import { AxiosDefaults, InternalAxiosRequestConfig } from 'axios';
import { Next } from 'middleware-axios';
import { cookieMiddleware } from '../cookie';
import { createCookieStore } from '../../../../http';

describe('cookieMiddleware', () => {
  it('should set cookie to config', async () => {
    const store = createCookieStore('hello=world');

    const middleware = cookieMiddleware(store);

    const config: InternalAxiosRequestConfig = {
      method: 'get',
      url: '/test-cookie-middleware',
      headers: { 'test-header': 'test-value' } as any,
    };
    const next: Next<unknown> = jest.fn(() =>
      Promise.resolve({
        data: null,
        status: 200,
        statusText: 'OK',
        config,
        headers: {},
      }),
    );
    const defaults: AxiosDefaults = {
      headers: {
        get: {},
        post: {},
        put: {},
        delete: {},
        patch: {},
        common: {},
        head: {},
      },
    };

    expect(next).toHaveBeenCalledTimes(0);
    await middleware(config, next, defaults);
    expect(next).toHaveBeenCalledTimes(1);

    expect(next).toHaveBeenCalledWith({
      method: 'get',
      url: '/test-cookie-middleware',
      headers: {
        'test-header': 'test-value',
        Cookie: 'hello=world',
      },
    });
  });

  it('should handle set-cookie header', async () => {
    const store = createCookieStore('hello=world');

    const spy = jest.fn();
    store.subscribe(spy);

    const middleware = cookieMiddleware(store);

    const config: InternalAxiosRequestConfig = {
      method: 'get',
      url: '/test-cookie-middleware',
      headers: { 'test-header': 'test-value' } as any,
    };
    const next: Next<unknown> = jest.fn(() =>
      Promise.resolve({
        data: null,
        status: 200,
        statusText: 'OK',
        config,
        headers: {
          'set-cookie': ['foo=bar', 'baz=123'],
        } as any,
      }),
    );
    const defaults: AxiosDefaults = {
      headers: {
        get: {},
        post: {},
        put: {},
        delete: {},
        patch: {},
        common: {},
        head: {},
      },
    };

    expect(next).toHaveBeenCalledTimes(0);
    expect(spy).toHaveBeenCalledTimes(0);
    await middleware(config, next, defaults);
    expect(next).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
