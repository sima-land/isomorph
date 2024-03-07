import {
  AxiosDefaults,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { Breadcrumb, DetailedError, Logger, createLogger } from '../../../../log';
import { AxiosLogging } from '../axios-logging';
import { severityFromStatus } from '../severity-from-status';

describe('AxiosLogging', () => {
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

  it('methods should do nothing when disabled', () => {
    const spy = jest.fn();
    const someLogger = createLogger();
    const handler = new AxiosLogging(someLogger, { config: {}, defaults: { headers: {} as any } });

    someLogger.subscribe(spy);
    handler.disabled = () => true;

    expect(spy).toHaveBeenCalledTimes(0);

    handler.beforeRequest();

    expect(spy).toHaveBeenCalledTimes(0);

    handler.afterResponse({
      response: {
        status: 200,
        statusText: '200',
        data: {},
        headers: {},
        config: {} as any,
      },
      config: {},
      defaults: { headers: {} as any },
    });

    expect(spy).toHaveBeenCalledTimes(0);

    handler.onCatch({
      config: {},
      defaults: { headers: {} as any },
      error: new Error('fake error'),
    });

    expect(spy).toHaveBeenCalledTimes(0);
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
