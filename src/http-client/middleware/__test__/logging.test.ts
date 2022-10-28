import { AxiosRequestConfig, AxiosDefaults, AxiosResponse } from 'axios';
import { Next } from 'middleware-axios';
import { loggingMiddleware, LogMiddlewareHandler, severityFromStatus } from '../logging';

function getFakeHandler(): LogMiddlewareHandler {
  return {
    beforeRequest: jest.fn(),
    afterResponse: jest.fn(),
    onCatch: jest.fn(),
  };
}

function handlerNotUsed(handler: LogMiddlewareHandler): boolean {
  const methods = [handler.beforeRequest, handler.afterResponse, handler.onCatch];

  const callCount = methods.reduce<number>(
    (acc, item) => acc + (item as jest.Mock).mock.calls.length,
    0,
  );

  return callCount === 0;
}

describe('loggingMiddleware', () => {
  let handler = getFakeHandler();

  beforeEach(() => {
    handler = getFakeHandler();
  });

  it('should works properly without error', async () => {
    const config: AxiosRequestConfig<any> = {};

    const defaults: AxiosDefaults<any> = {
      headers: {} as any,
      baseURL: 'https://sima.com/',
    };

    const response: AxiosResponse = {
      status: 200,
      statusText: '200',
      data: {},
      headers: {},
      config: {},
    };

    const next: Next<any> = jest.fn(() => Promise.resolve(response));

    const middleware = loggingMiddleware(handler);

    expect(handlerNotUsed(handler)).toBe(true);

    await middleware(config, next, defaults);

    expect(handler.beforeRequest).toBeCalledTimes(1);
    expect(handler.beforeRequest).toBeCalledWith({ config, defaults });
    expect(handler.afterResponse).toBeCalledTimes(1);
    expect(handler.afterResponse).toBeCalledWith({ config, defaults, response });
    expect(handler.onCatch).toBeCalledTimes(0);
  });

  it('should works properly with error', async () => {
    const config: AxiosRequestConfig<any> = {};

    const defaults: AxiosDefaults<any> = {
      headers: {} as any,
      baseURL: 'https://sima.com/',
    };

    const error = new Error('Some test error');

    const next: Next<any> = jest.fn(() => Promise.reject(error));

    const middleware = loggingMiddleware(handler);

    expect(handlerNotUsed(handler)).toBe(true);

    await middleware(config, next, defaults).catch(() => null);

    expect(handler.beforeRequest).toBeCalledTimes(1);
    expect(handler.beforeRequest).toBeCalledWith({ config, defaults });
    expect(handler.afterResponse).toBeCalledTimes(0);
    expect(handler.onCatch).toBeCalledTimes(1);
    expect(handler.onCatch).toBeCalledWith({ config, defaults, error });
  });

  it('should handle handler factory', async () => {
    const config: AxiosRequestConfig<any> = {};

    const defaults: AxiosDefaults<any> = {
      headers: {} as any,
      baseURL: 'https://sima.com/',
    };

    const response: AxiosResponse = {
      status: 200,
      statusText: '200',
      data: {},
      headers: {},
      config: {},
    };

    const next: Next<any> = jest.fn(() => Promise.resolve(response));

    const handlerFactory = jest.fn(() => handler);

    const middleware = loggingMiddleware(handlerFactory);

    expect(handlerNotUsed(handler)).toBe(true);

    await middleware(config, next, defaults);

    expect(handlerFactory).toBeCalledTimes(1);
    expect(handlerFactory).toBeCalledWith({ config, defaults });
    expect(handler.beforeRequest).toBeCalledTimes(1);
    expect(handler.beforeRequest).toBeCalledWith({ config, defaults });
    expect(handler.afterResponse).toBeCalledTimes(1);
    expect(handler.afterResponse).toBeCalledWith({ config, defaults, response });
    expect(handler.onCatch).toBeCalledTimes(0);
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
