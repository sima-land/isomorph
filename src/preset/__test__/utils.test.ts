import { Env } from '@humanwhocodes/env';
import { AxiosRequestConfig, AxiosDefaults } from 'axios';
import { SentryBreadcrumb, SentryError } from '../../error-tracking';
import { severityFromStatus } from '../../http-client/middleware/logging';
import { Logger } from '../../logger';
import { HttpApiHostPool, HttpClientLogHandler } from '../utils';

// jest.useFakeTimers();

describe('HttpApiHostPool', () => {
  it('.get() should return value from map', () => {
    const source = new Env({
      API_FOO: 'http://www.foo.com',
      API_BAR: 'http://www.bar.com',
    });

    const pool = new HttpApiHostPool({ foo: 'API_FOO', bar: 'API_BAR' }, source);

    expect(pool.get('foo')).toBe('http://www.foo.com');
    expect(pool.get('bar')).toBe('http://www.bar.com');
  });

  it('.get() should throw error when variable name is undefined', () => {
    const source = new Env({
      API_FOO: 'http://www.foo.com',
    });

    const pool = new HttpApiHostPool({ foo: 'API_FOO' }, source);

    expect(pool.get('foo')).toBe('http://www.foo.com');

    expect(() => {
      pool.get('bar' as any);
    }).toThrow(`Known HTTP API not found by key "bar"`);
  });
});

describe('HttpClientLogHandler', () => {
  const logger: Logger = {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    subscribe: jest.fn(),
  };

  beforeEach(() => {
    (logger.info as jest.Mock).mockClear();
    (logger.error as jest.Mock).mockClear();
  });

  it('should log ready url properly when baseURL and url provided', async () => {
    const config: AxiosRequestConfig<any> = {
      url: '/foo/bar',
    };

    const defaults: AxiosDefaults<any> = {
      headers: {} as any,
      baseURL: 'https://sima.com/',
    };

    const response = {
      status: 200,
      statusText: '200',
      data: {},
      headers: {},
      config,
    };

    const handler = new HttpClientLogHandler({ config, defaults, logger });

    handler.beforeRequest({ config, defaults, logger });
    handler.afterResponse({ config, defaults, logger, response });

    expect(logger.info).toBeCalledTimes(2);
    expect((logger.info as jest.Mock).mock.calls[0]).toEqual([
      new SentryBreadcrumb({
        category: 'http.request',
        type: 'http',
        data: {
          url: 'https://sima.com/foo/bar',
          method: 'get',
          params: undefined,
        },
        level: 'info',
      }),
    ]);
    expect((logger.info as jest.Mock).mock.calls[1]).toEqual([
      new SentryBreadcrumb({
        category: 'http.response',
        type: 'http',
        data: {
          url: 'https://sima.com/foo/bar',
          method: 'get',
          params: undefined,
          status_code: 200,
        },
        level: 'info',
      }),
    ]);
  });

  it('should log ready url properly when only baseURL provided', async () => {
    const config: AxiosRequestConfig<any> = {};

    const defaults: AxiosDefaults<any> = {
      headers: {} as any,
      baseURL: 'https://sima.com/',
    };

    const response = {
      status: 200,
      statusText: '200',
      data: {},
      headers: {},
      config: {},
    };

    const handler = new HttpClientLogHandler({ config, defaults, logger });

    handler.beforeRequest({ config, defaults, logger });
    handler.afterResponse({ config, defaults, logger, response });

    expect(logger.info).toBeCalledTimes(2);
    expect((logger.info as jest.Mock).mock.calls[0]).toEqual([
      new SentryBreadcrumb({
        category: 'http.request',
        type: 'http',
        data: {
          url: 'https://sima.com/',
          method: 'get',
          params: undefined,
        },
        level: 'info',
      }),
    ]);
    expect((logger.info as jest.Mock).mock.calls[1]).toEqual([
      new SentryBreadcrumb({
        category: 'http.response',
        type: 'http',
        data: {
          url: 'https://sima.com/',
          method: 'get',
          params: undefined,
          status_code: 200,
        },
        level: 'info',
      }),
    ]);
  });

  it('should log ready url properly when only url provided', async () => {
    const config: AxiosRequestConfig<any> = {
      url: 'https://ya.ru',
      params: { foo: 'bar' },
    };

    const defaults: AxiosDefaults<any> = {
      headers: {} as any,
    };

    const response = {
      status: 200,
      statusText: '200',
      data: {},
      headers: {},
      config: {},
    };

    const handler = new HttpClientLogHandler({ config, defaults, logger });

    handler.beforeRequest({ config, defaults, logger });
    handler.afterResponse({ config, defaults, logger, response });

    expect(logger.info).toBeCalledTimes(2);
    expect((logger.info as jest.Mock).mock.calls[0]).toEqual([
      new SentryBreadcrumb({
        category: 'http.request',
        type: 'http',
        data: {
          url: 'https://ya.ru',
          method: 'get',
          params: { foo: 'bar' },
        },
        level: 'info',
      }),
    ]);
    expect((logger.info as jest.Mock).mock.calls[1]).toEqual([
      new SentryBreadcrumb({
        category: 'http.response',
        type: 'http',
        data: {
          url: 'https://ya.ru',
          method: 'get',
          params: { foo: 'bar' },
          status_code: 200,
        },
        level: 'info',
      }),
    ]);
  });

  it('should log axios error', async () => {
    const error = {
      name: 'TestError',
      message: 'test',
      response: { status: 407 },
      isAxiosError: true,
      toJSON: () => error,
    };

    const config: AxiosRequestConfig<any> = {
      url: 'https://ya.ru',
      params: { bar: 'baz' },
    };

    const defaults: AxiosDefaults<any> = {
      headers: {} as any,
    };

    const handler = new HttpClientLogHandler({ config, defaults, logger });

    expect(logger.error).toBeCalledTimes(0);
    expect(logger.info).toBeCalledTimes(0);

    handler.beforeRequest({ config, defaults, logger });
    handler.onCatch({ config, defaults, logger, error });

    expect(logger.error).toBeCalledTimes(1);
    expect(logger.info).toBeCalledTimes(2);
  });

  it('should log axios error without status', async () => {
    const error = {
      name: 'TestError',
      message: 'test',
      response: { status: undefined },
      isAxiosError: true,
      toJSON: () => error,
    };

    const config: AxiosRequestConfig<any> = {
      url: 'https://ya.ru',
    };

    const defaults: AxiosDefaults<any> = {
      headers: {} as any,
    };

    const handler = new HttpClientLogHandler({ config, defaults, logger });

    expect(logger.error).toBeCalledTimes(0);
    expect(logger.info).toBeCalledTimes(0);

    handler.beforeRequest({ config, defaults, logger });
    handler.onCatch({ config, defaults, logger, error });

    expect(logger.error).toBeCalledTimes(1);
    expect(logger.info).toBeCalledTimes(1);

    const loggerErrorArgument: any = (logger.error as jest.Mock).mock.calls[0][0];

    expect(loggerErrorArgument instanceof SentryError).toBe(true);
    expect(loggerErrorArgument).toEqual(
      new SentryError(`HTTP request failed, status code: UNKNOWN, error message: test`, {
        level: severityFromStatus(error.response?.status),
        context: {
          key: 'Request details',
          data: {
            error,
            url: 'https://ya.ru',
            baseURL: undefined,
            method: 'GET',
            headers: {
              ...config.headers,
              ...defaults.headers.get,
            },
            params: { bar: 'baz' },
            data: undefined,
          },
        },
      }),
    );

    expect(loggerErrorArgument.data.context[1].data.error).toBe(error);
  });

  it('should log NOT axios error', async () => {
    const error = {
      name: 'TestError',
      message: 'test',
      response: { status: 407 },
    };

    const config: AxiosRequestConfig<any> = {
      url: 'https://ya.ru',
    };

    const defaults: AxiosDefaults<any> = {
      headers: {} as any,
    };

    const handler = new HttpClientLogHandler({ config, defaults, logger });

    expect(logger.error).toBeCalledTimes(0);
    expect(logger.info).toBeCalledTimes(0);

    handler.beforeRequest({ config, defaults, logger });
    handler.onCatch({ config, defaults, logger, error });

    expect(logger.error).toBeCalledTimes(1);
    expect(logger.info).toBeCalledTimes(1);
  });
});
