import { AxiosDefaults, AxiosRequestConfig } from 'axios';
import { Request, Response } from 'express';
import { Next } from 'middleware-axios';
import { createCookieStore, collectCookieMiddleware } from '../cookie';

describe('createCookieStore', () => {
  it('should save/take cookies correctly', () => {
    const initialCookie = 'foo=1; bar=2; baz=3';
    const store = createCookieStore(initialCookie);

    expect(store.asHeader()).toBe(initialCookie);

    store.set(['hello=world; Secure', 'foo=345; HttpOnly']);
    expect(store.asHeader()).toBe('foo=345; bar=2; baz=3; hello=world');

    store.set(['baz=777']);
    expect(store.asHeader()).toBe('foo=345; bar=2; baz=777; hello=world');
  });

  it('should handle undefined initial cookies', () => {
    const store = createCookieStore();

    expect(store.asHeader()).toBe('');

    store.set(['hello=world; Secure', 'foo=345; HttpOnly']);
    expect(store.asHeader()).toBe('hello=world; foo=345');

    store.set(['baz=432']);
    expect(store.asHeader()).toBe('hello=world; foo=345; baz=432');
  });
});

describe('collectCookieMiddleware', () => {
  it('should set cookie to config', async () => {
    const request: Request = {
      get: (headerName: string) => (headerName === 'cookie' ? 'hello=world' : ''),
    } as unknown as Request;

    const response: Response = {
      setHeader: jest.fn(),
    } as unknown as Response;

    const middleware = collectCookieMiddleware(request, response);

    const config: AxiosRequestConfig = {
      method: 'get',
      url: '/test-cookie-middleware',
      headers: { 'test-header': 'test-value' },
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
    const request: Request = {
      get: (headerName: string) => (headerName === 'cookie' ? 'hello=world' : ''),
    } as unknown as Request;

    const response: Response = {
      setHeader: jest.fn(),
    } as unknown as Response;

    const middleware = collectCookieMiddleware(request, response);

    const config: AxiosRequestConfig = {
      method: 'get',
      url: '/test-cookie-middleware',
      headers: { 'test-header': 'test-value' },
    };
    const next: Next<unknown> = jest.fn(() =>
      Promise.resolve({
        data: null,
        status: 200,
        statusText: 'OK',
        config,
        headers: {
          'set-cookie': 'foo=bar',
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
    expect(response.setHeader).toHaveBeenCalledTimes(0);
    await middleware(config, next, defaults);
    expect(next).toHaveBeenCalledTimes(1);
    expect(response.setHeader).toHaveBeenCalledTimes(1);
  });
});
