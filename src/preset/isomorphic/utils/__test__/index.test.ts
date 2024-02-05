import { Env } from '@humanwhocodes/env';
import {
  AxiosRequestConfig,
  AxiosDefaults,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { Logger, Breadcrumb, DetailedError } from '../../../../log';
import {
  HttpApiHostPool,
  AxiosLogging,
  SagaLogging,
  severityFromStatus,
  HttpStatus,
  displayUrl,
} from '..';

describe('displayUrl', () => {
  const cases: Array<{ name: string; url: string; baseURL: string; expectedUrl: string }> = [
    // baseURL и url
    {
      name: 'baseURL (with trailing slash) + url (with leading slash)',
      baseURL: 'https://www.base.com/',
      url: '/user/current',
      expectedUrl: 'https://www.base.com/user/current',
    },
    {
      name: 'baseURL (no trailing slash) + url (no leading slash)',
      baseURL: 'https://www.base.com',
      url: 'user/current',
      expectedUrl: 'https://www.base.com/user/current',
    },
    {
      name: 'baseURL (no trailing slash) + url (with leading slash)',
      baseURL: 'https://www.base.com',
      url: '/user/current',
      expectedUrl: 'https://www.base.com/user/current',
    },
    {
      name: 'baseURL (with trailing slash) + url (no leading slash)',
      baseURL: 'https://www.base.com/',
      url: 'admin/all',
      expectedUrl: 'https://www.base.com/admin/all',
    },

    // только baseURL
    {
      name: 'only baseURL',
      baseURL: 'www.test.com',
      url: '',
      expectedUrl: 'www.test.com',
    },
    {
      name: 'only baseURL (with trailing slash)',
      baseURL: 'www.test.com/',
      url: '',
      expectedUrl: 'www.test.com/',
    },

    // только url
    {
      name: 'only url (with leading slash)',
      baseURL: '',
      url: '/hello/world',
      expectedUrl: '/hello/world',
    },
    {
      name: 'only url (no leading slash)',
      baseURL: '',
      url: 'some/path',
      expectedUrl: 'some/path',
    },

    // ничего
    {
      name: 'no baseURL + no url',
      baseURL: '',
      url: '',
      expectedUrl: '[empty]',
    },
  ];

  for (const { baseURL, url, expectedUrl, ...meta } of cases) {
    it(`${meta.name}`, () => {
      expect(displayUrl(baseURL, url)).toBe(expectedUrl);
    });
  }
});

const logger: Logger = {
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  subscribe: jest.fn(),
};

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

describe('severityFromStatus', () => {
  it('should works', () => {
    expect(severityFromStatus(200)).toBe('info');
    expect(severityFromStatus(201)).toBe('info');
    expect(severityFromStatus(204)).toBe('info');

    expect(severityFromStatus(300)).toBe('warning');
    expect(severityFromStatus(302)).toBe('warning');
    expect(severityFromStatus(400)).toBe('warning');
    expect(severityFromStatus(404)).toBe('warning');
    expect(severityFromStatus(422)).toBe('warning');
    expect(severityFromStatus(499)).toBe('warning');

    expect(severityFromStatus(undefined)).toBe('error');
    expect(severityFromStatus(100)).toBe('error');
    expect(severityFromStatus(199)).toBe('error');
    expect(severityFromStatus(500)).toBe('error');
    expect(severityFromStatus(503)).toBe('error');
  });
});

describe('HttpClientLogging', () => {
  beforeEach(() => {
    (logger.info as jest.Mock).mockClear();
    (logger.error as jest.Mock).mockClear();
  });

  it('should log ready url properly when baseURL and url provided', async () => {
    const config: InternalAxiosRequestConfig<any> = {
      url: '/foo/bar',
    } as any;

    const defaults: AxiosDefaults<any> = {
      headers: {} as any,
      baseURL: 'https://sima.com/',
    };

    const response: AxiosResponse = {
      status: 200,
      statusText: '200',
      data: {},
      headers: {},
      config,
    };

    const handler = new AxiosLogging(logger, { config, defaults });

    handler.beforeRequest();
    handler.afterResponse({ config, defaults, response });

    expect(logger.info).toHaveBeenCalledTimes(2);
    expect((logger.info as jest.Mock).mock.calls[0]).toEqual([
      new Breadcrumb({
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
      new Breadcrumb({
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
    const config: InternalAxiosRequestConfig<any> = {} as any;

    const defaults: AxiosDefaults<any> = {
      headers: {} as any,
      baseURL: 'https://sima.com/',
    };

    const response: AxiosResponse = {
      status: 200,
      statusText: '200',
      data: {},
      headers: {},
      config: {} as any,
    };

    const handler = new AxiosLogging(logger, { config, defaults });

    handler.beforeRequest();
    handler.afterResponse({ config, defaults, response });

    expect(logger.info).toHaveBeenCalledTimes(2);
    expect((logger.info as jest.Mock).mock.calls[0]).toEqual([
      new Breadcrumb({
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
      new Breadcrumb({
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

    const response: AxiosResponse = {
      status: 200,
      statusText: '200',
      data: {},
      headers: {},
      config: {} as any,
    };

    const handler = new AxiosLogging(logger, { config, defaults });

    handler.beforeRequest();
    handler.afterResponse({ config, defaults, response });

    expect(logger.info).toHaveBeenCalledTimes(2);
    expect((logger.info as jest.Mock).mock.calls[0]).toEqual([
      new Breadcrumb({
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
      new Breadcrumb({
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

    const handler = new AxiosLogging(logger, { config, defaults });

    expect(logger.error).toHaveBeenCalledTimes(0);
    expect(logger.info).toHaveBeenCalledTimes(0);

    handler.beforeRequest();
    handler.onCatch({ config, defaults, error });

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledTimes(2);
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

    const handler = new AxiosLogging(logger, { config, defaults });

    expect(logger.error).toHaveBeenCalledTimes(0);
    expect(logger.info).toHaveBeenCalledTimes(0);

    handler.beforeRequest();
    handler.onCatch({ config, defaults, error });

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledTimes(1);

    const loggerErrorArgument: any = (logger.error as jest.Mock).mock.calls[0][0];

    expect(loggerErrorArgument instanceof DetailedError).toBe(true);
    expect(loggerErrorArgument).toEqual(
      new DetailedError(`HTTP request failed, status code: UNKNOWN, error message: test`, {
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

    const handler = new AxiosLogging(logger, { config, defaults });

    expect(logger.error).toHaveBeenCalledTimes(0);
    expect(logger.info).toHaveBeenCalledTimes(0);

    handler.beforeRequest();
    handler.onCatch({ config, defaults, error });

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledTimes(1);
  });
});

describe('SagaLogging', () => {
  beforeEach(() => {
    (logger.info as jest.Mock).mockClear();
    (logger.error as jest.Mock).mockClear();
  });

  it('should handle saga error properly', () => {
    const handler = new SagaLogging(logger);

    expect(logger.error).toHaveBeenCalledTimes(0);
    handler.onSagaError(new Error('my test error'), { sagaStack: 'my test stack' });
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it('should handle config error properly', () => {
    const handler = new SagaLogging(logger);
    const error = new Error('my test error');

    expect(logger.error).toHaveBeenCalledTimes(0);
    handler.onConfigError(error);
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(error);
  });

  it('should handle timeout interrupt properly', () => {
    const handler = new SagaLogging(logger);
    const info = { timeout: 250 };

    expect(logger.error).toHaveBeenCalledTimes(0);
    handler.onTimeoutInterrupt(info);
    expect(logger.error).toHaveBeenCalledTimes(1);
  });
});

describe('HttpStatus', () => {
  it('isOk', () => {
    expect(HttpStatus.isOk(200)).toBe(true);
    expect(HttpStatus.isOk(201)).toBe(false);
    expect(HttpStatus.isOk(199)).toBe(false);
  });

  it('isPostOk', () => {
    expect(HttpStatus.isPostOk(201)).toBe(true);
    expect(HttpStatus.isPostOk(200)).toBe(false);
    expect(HttpStatus.isPostOk(300)).toBe(false);
    expect(HttpStatus.isPostOk(400)).toBe(false);
  });

  it('isDeleteOk', () => {
    expect(HttpStatus.isDeleteOk(204)).toBe(true);
    expect(HttpStatus.isDeleteOk(200)).toBe(true);
    expect(HttpStatus.isDeleteOk(199)).toBe(false);
    expect(HttpStatus.isDeleteOk(300)).toBe(false);
    expect(HttpStatus.isDeleteOk(400)).toBe(false);
  });

  describe('createMiddleware', () => {
    const middleware = HttpStatus.axiosMiddleware();

    it('should NOT change validateStatus when is already defined as null', async () => {
      const config = { validateStatus: null };
      const next = jest.fn();
      const defaults = { headers: {} as any };

      await middleware(config, next, defaults);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(config);
    });

    it('should NOT set validateStatus when is already defined as function', async () => {
      const config = { validateStatus: () => false };
      const next = jest.fn();
      const defaults = { headers: {} as any };

      await middleware(config, next, defaults);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(config);
    });

    it('should NOT set validateStatus when is already defined as null in defaults', async () => {
      const config = {};
      const next = jest.fn();
      const defaults = { headers: {} as any, validateStatus: null };

      await middleware(config, next, defaults);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(config);
    });

    it('should NOT set validateStatus when is already defined as function in defaults', async () => {
      const config = {};
      const next = jest.fn();
      const defaults = { headers: {} as any, validateStatus: () => false };

      await middleware(config, next, defaults);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(config);
    });

    it('should set validateStatus for known statuses in config', async () => {
      const cases: Array<[string | undefined, (status: unknown) => boolean]> = [
        [undefined, HttpStatus.isOk],
        ['get', HttpStatus.isOk],
        ['GET', HttpStatus.isOk],
        ['put', HttpStatus.isOk],
        ['PUT', HttpStatus.isOk],
        ['post', HttpStatus.isPostOk],
        ['POST', HttpStatus.isPostOk],
        ['delete', HttpStatus.isDeleteOk],
        ['DELETE', HttpStatus.isDeleteOk],
      ];

      for (const [method, validator] of cases) {
        const config = { method };
        const next = jest.fn();
        const defaults = { headers: {} as any };

        await middleware(config, next, defaults);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith({ ...config, validateStatus: validator });
      }
    });
  });
});
