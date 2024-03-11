import { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import { Next } from 'middleware-axios';
import { logMiddleware, LogMiddlewareHandler } from '../log';

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

describe('logMiddleware', () => {
  let handler = getFakeHandler();

  beforeEach(() => {
    handler = getFakeHandler();
  });

  it('should works properly without error', async () => {
    const config: AxiosRequestConfig<any> = {};

    const defaults: AxiosInstance['defaults'] = {
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

    const next: Next<any> = jest.fn(() => Promise.resolve(response));

    const middleware = logMiddleware(handler);

    expect(handlerNotUsed(handler)).toBe(true);

    await middleware(config, next, defaults);

    expect(handler.beforeRequest).toHaveBeenCalledTimes(1);
    expect(handler.beforeRequest).toHaveBeenCalledWith({ config, defaults });
    expect(handler.afterResponse).toHaveBeenCalledTimes(1);
    expect(handler.afterResponse).toHaveBeenCalledWith({ config, defaults, response });
    expect(handler.onCatch).toHaveBeenCalledTimes(0);
  });

  it('should works properly with error', async () => {
    const config: AxiosRequestConfig<any> = {};

    const defaults: AxiosInstance['defaults'] = {
      headers: {} as any,
      baseURL: 'https://sima.com/',
    };

    const error = new Error('Some test error');

    const next: Next<any> = jest.fn(() => Promise.reject(error));

    const middleware = logMiddleware(handler);

    expect(handlerNotUsed(handler)).toBe(true);

    await middleware(config, next, defaults).catch(() => null);

    expect(handler.beforeRequest).toHaveBeenCalledTimes(1);
    expect(handler.beforeRequest).toHaveBeenCalledWith({ config, defaults });
    expect(handler.afterResponse).toHaveBeenCalledTimes(0);
    expect(handler.onCatch).toHaveBeenCalledTimes(1);
    expect(handler.onCatch).toHaveBeenCalledWith({ config, defaults, error });
  });

  it('should handle handler factory', async () => {
    const config: AxiosRequestConfig<any> = {};

    const defaults: AxiosInstance['defaults'] = {
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

    const next: Next<any> = jest.fn(() => Promise.resolve(response));

    const handlerFactory = jest.fn(() => handler);

    const middleware = logMiddleware(handlerFactory);

    expect(handlerNotUsed(handler)).toBe(true);

    await middleware(config, next, defaults);

    expect(handlerFactory).toHaveBeenCalledTimes(1);
    expect(handlerFactory).toHaveBeenCalledWith({ config, defaults });
    expect(handler.beforeRequest).toHaveBeenCalledTimes(1);
    expect(handler.beforeRequest).toHaveBeenCalledWith({ config, defaults });
    expect(handler.afterResponse).toHaveBeenCalledTimes(1);
    expect(handler.afterResponse).toHaveBeenCalledWith({ config, defaults, response });
    expect(handler.onCatch).toHaveBeenCalledTimes(0);
  });
});
