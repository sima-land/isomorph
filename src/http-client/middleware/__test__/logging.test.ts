import { AxiosRequestConfig, AxiosDefaults } from 'axios';
import { Next } from 'middleware-axios';
import { SentryBreadcrumb, SentryError } from '../../../error-tracking';
import { Logger } from '../../../logger';
import { loggingMiddleware, severityFromStatus } from '../logging';
import { Severity } from '@sentry/types';

jest.useFakeTimers();

describe('loggingMiddleware', () => {
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
    const middleware = loggingMiddleware(logger);

    const config: AxiosRequestConfig<any> = {
      url: '/foo/bar',
    };

    const defaults: AxiosDefaults<any> = {
      headers: {} as any,
      baseURL: 'https://sima.com/',
    };

    const next: Next<any> = jest.fn(() =>
      Promise.resolve({
        status: 200,
        statusText: '200',
        data: {},
        headers: {},
        config: {},
      }),
    );

    await middleware(config, next, defaults);

    expect(logger.info).toBeCalledTimes(2);
    expect((logger.info as jest.Mock).mock.calls[0]).toEqual([
      new SentryBreadcrumb({
        category: 'http.request',
        type: 'http',
        data: {
          url: 'https://sima.com/foo/bar',
          method: 'GET',
          params: undefined,
        },
        level: Severity.Info,
      }),
    ]);
    expect((logger.info as jest.Mock).mock.calls[1]).toEqual([
      new SentryBreadcrumb({
        category: 'http.response',
        type: 'http',
        data: {
          url: 'https://sima.com/foo/bar',
          method: 'GET',
          params: undefined,
          status_code: 200,
        },
        level: Severity.Info,
      }),
    ]);
  });

  it('should log ready url properly when only baseURL provided', async () => {
    const middleware = loggingMiddleware(logger);

    const config: AxiosRequestConfig<any> = {};

    const defaults: AxiosDefaults<any> = {
      headers: {} as any,
      baseURL: 'https://sima.com/',
    };

    const next: Next<any> = jest.fn(() =>
      Promise.resolve({
        status: 200,
        statusText: '200',
        data: {},
        headers: {},
        config: {},
      }),
    );

    await middleware(config, next, defaults);

    expect(logger.info).toBeCalledTimes(2);
    expect((logger.info as jest.Mock).mock.calls[0]).toEqual([
      new SentryBreadcrumb({
        category: 'http.request',
        type: 'http',
        data: {
          url: 'https://sima.com/',
          method: 'GET',
          params: undefined,
        },
        level: Severity.Info,
      }),
    ]);
    expect((logger.info as jest.Mock).mock.calls[1]).toEqual([
      new SentryBreadcrumb({
        category: 'http.response',
        type: 'http',
        data: {
          url: 'https://sima.com/',
          method: 'GET',
          params: undefined,
          status_code: 200,
        },
        level: Severity.Info,
      }),
    ]);
  });

  it('should log ready url properly when only url provided', async () => {
    const middleware = loggingMiddleware(logger);

    const config: AxiosRequestConfig<any> = {
      url: 'https://ya.ru',
    };

    const defaults: AxiosDefaults<any> = {
      headers: {} as any,
    };

    const next: Next<any> = jest.fn(() =>
      Promise.resolve({
        status: 200,
        statusText: '200',
        data: {},
        headers: {},
        config: {},
      }),
    );

    await middleware(config, next, defaults);

    expect(logger.info).toBeCalledTimes(2);
    expect((logger.info as jest.Mock).mock.calls[0]).toEqual([
      new SentryBreadcrumb({
        category: 'http.request',
        type: 'http',
        data: {
          url: 'https://ya.ru',
          method: 'GET',
          params: undefined,
        },
        level: Severity.Info,
      }),
    ]);
    expect((logger.info as jest.Mock).mock.calls[1]).toEqual([
      new SentryBreadcrumb({
        category: 'http.response',
        type: 'http',
        data: {
          url: 'https://ya.ru',
          method: 'GET',
          params: undefined,
          status_code: 200,
        },
        level: Severity.Info,
      }),
    ]);
  });

  it('should log axios error', async () => {
    const error = {
      message: 'test',
      response: { status: 407 },
      isAxiosError: true,
    };

    const middleware = loggingMiddleware(logger);

    const config: AxiosRequestConfig<any> = {
      url: 'https://ya.ru',
    };

    const defaults: AxiosDefaults<any> = {
      headers: {} as any,
    };

    const next: Next<any> = jest.fn(() => Promise.reject(error));

    let resultError: any;

    expect(logger.error).toBeCalledTimes(0);
    expect(logger.info).toBeCalledTimes(0);

    try {
      await middleware(config, next, defaults);
    } catch (err) {
      resultError = err;
    }

    expect(logger.error).toBeCalledTimes(1);
    expect(logger.info).toBeCalledTimes(2);
    expect(resultError).toBe(error);
  });

  it('should log axios error without status', async () => {
    const error = {
      message: 'test',
      response: { status: undefined },
      isAxiosError: true,
    };

    const middleware = loggingMiddleware(logger);

    const config: AxiosRequestConfig<any> = {
      url: 'https://ya.ru',
    };

    const defaults: AxiosDefaults<any> = {
      headers: {} as any,
    };

    const next: Next<any> = jest.fn(() => Promise.reject(error));

    let resultError: any;

    expect(logger.error).toBeCalledTimes(0);
    expect(logger.info).toBeCalledTimes(0);

    try {
      await middleware(config, next, defaults);
    } catch (err) {
      resultError = err;
    }

    expect(logger.error).toBeCalledTimes(1);
    expect(logger.info).toBeCalledTimes(2);
    expect(resultError).toBe(error);

    expect((logger.error as jest.Mock).mock.calls[0][0]).toEqual(
      new SentryError(`HTTP request failed with status code UNKNOWN`, {
        level: severityFromStatus(error.response?.status),
        context: {
          key: 'Request details',
          data: {
            url: 'https://ya.ru',
            baseURL: undefined,
            method: 'GET',
            headers: {
              ...config.headers,
              ...defaults.headers.get,
            },
            params: undefined,
            data: undefined,
          },
        },
      }),
    );
  });

  it('should log NOT axios error', async () => {
    const error = {
      message: 'test',
      response: { status: 407 },
    };

    const middleware = loggingMiddleware(logger);

    const config: AxiosRequestConfig<any> = {
      url: 'https://ya.ru',
    };

    const defaults: AxiosDefaults<any> = {
      headers: {} as any,
    };

    const next: Next<any> = jest.fn(() => Promise.reject(error));

    let resultError: any;

    expect(logger.error).toBeCalledTimes(0);
    expect(logger.info).toBeCalledTimes(0);

    try {
      await middleware(config, next, defaults);
    } catch (err) {
      resultError = err;
    }

    expect(logger.error).toBeCalledTimes(0);
    expect(logger.info).toBeCalledTimes(1);
    expect(resultError).toBe(error);
  });
});

describe('severityFromStatus', () => {
  it('should works', () => {
    expect(severityFromStatus(200)).toBe(Severity.Info);
    expect(severityFromStatus(201)).toBe(Severity.Info);
    expect(severityFromStatus(204)).toBe(Severity.Info);

    expect(severityFromStatus(300)).toBe(Severity.Warning);
    expect(severityFromStatus(302)).toBe(Severity.Warning);
    expect(severityFromStatus(400)).toBe(Severity.Warning);
    expect(severityFromStatus(404)).toBe(Severity.Warning);
    expect(severityFromStatus(422)).toBe(Severity.Warning);
    expect(severityFromStatus(499)).toBe(Severity.Warning);

    expect(severityFromStatus(undefined)).toBe(Severity.Error);
    expect(severityFromStatus(100)).toBe(Severity.Error);
    expect(severityFromStatus(199)).toBe(Severity.Error);
    expect(severityFromStatus(500)).toBe(Severity.Error);
    expect(severityFromStatus(503)).toBe(Severity.Error);
  });
});
