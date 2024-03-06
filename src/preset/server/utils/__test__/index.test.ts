import {
  healthCheck,
  getPageResponseFormat,
  getForwardedHeaders,
  getServeLogging,
  getServeErrorLogging,
  getServeMeasuring,
  getFetchTracing,
  applyServerMiddleware,
} from '..';
import { BaseConfig } from '../../../../config';
import { DetailedError, createLogger } from '../../../../log';
import { RESPONSE_EVENT_TYPE } from '../../../isomorphic/constants';
import { ServerMiddleware } from '../../types';

describe('getPageResponseFormat', () => {
  it('should return json', () => {
    const request = new Request('http://test.com', {
      headers: { accept: 'application/json' },
    });

    expect(getPageResponseFormat(request)).toBe('json');
  });

  it('should return html when no accept', () => {
    const request = new Request('http://test.com', {
      headers: { accept: '' },
    });

    expect(getPageResponseFormat(request)).toBe('html');
  });

  it('should return html', () => {
    const request = new Request('http://test.com', {
      headers: { accept: 'text/html' },
    });

    expect(getPageResponseFormat(request)).toBe('html');
  });
});

describe('getForwardedHeaders', () => {
  it('should contain headers by convention', () => {
    const config = { appName: 'app_name', appVersion: 'version', env: 'env' };
    const request = new Request('http://test.com', {
      headers: {
        'x-client-ip': '127.0.0.89',
        'simaland-foo': 'hello',
        'simaland-bar': 'world',
        'simaland-params': JSON.stringify({ testParam: 123 }),
      },
    });
    const result = getForwardedHeaders(config, request);

    expect(result.get('user-agent')).toBe('simaland-app_name/version');
    expect(result.get('x-client-ip')).toBe('127.0.0.89');
    expect(result.get('simaland-foo')).toBe('hello');
    expect(result.get('simaland-bar')).toBe('world');
    expect(result.get('simaland-params')).toBe(null);
  });

  it('should not contain x-client-ip when client ip is not defined', () => {
    const config = { appName: 'app_name', appVersion: 'version', env: 'env' };
    const request = new Request('http://test.com', {
      headers: {
        'simaland-foo': 'hello',
        'simaland-bar': 'world',
      },
    });
    const result = getForwardedHeaders(config, request);

    expect(result.get('user-agent')).toBe('simaland-app_name/version');
    expect(result.get('x-client-ip')).toBe(null);
    expect(result.get('simaland-foo')).toBe('hello');
    expect(result.get('simaland-bar')).toBe('world');
  });
});

describe('healthCheck', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('handler should return response', async () => {
    const handler = healthCheck();
    const request = new Request('');

    const res1 = await handler(request);
    expect(res1.headers.get('content-type')).toBe('application/json');
    expect(await res1.json()).toEqual({ uptime: 0 });

    jest.advanceTimersByTime(1000);

    const res2 = await handler(request);
    expect(res2.headers.get('content-type')).toBe('application/json');
    expect(await res2.json()).toEqual({ uptime: 1000 });
  });
});

describe('getServeLogging', () => {
  it('should log request and response', async () => {
    const spy = jest.fn();
    const logger = createLogger();

    logger.subscribe(spy);

    const middleware = getServeLogging(logger);

    const signal = new EventTarget();

    const next = () =>
      new Promise<Response>(resolve => {
        signal.addEventListener(
          'response',
          () => {
            resolve(new Response('OK', { status: 200 }));
          },
          { once: true },
        );
      });

    middleware(new Request('http://test.ru'), next);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toEqual({
      type: 'info',
      data: {
        type: 'http.request[incoming]',
        route: 'http://test.ru',
        method: 'GET',
        remote_ip: null,
      },
    });

    signal.dispatchEvent(new Event('response'));
    await Promise.resolve();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0]).toEqual({
      type: 'info',
      data: {
        type: 'http.response[outgoing]',
        route: 'http://test.ru',
        method: 'GET',
        status: 200,
        remote_ip: null,
        latency: expect.any(Number),
      },
    });
  });
});

describe('getServeErrorLogging', () => {
  it('should log error', async () => {
    const spy = jest.fn();
    const logger = createLogger();

    logger.subscribe(spy);

    const request = new Request('http://test.ru');
    const middleware = getServeErrorLogging(logger);

    await Promise.resolve(middleware(request, () => Promise.reject('FAKE ERROR'))).catch(() => {});

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toEqual({
      type: 'error',
      data: new DetailedError('FAKE ERROR', {
        level: 'error',
        context: [
          {
            key: 'Incoming request details',
            data: {
              url: 'http://test.ru',
              method: 'GET',
              headers: {},
              params: {},
            },
          },
        ],
      }),
    });
  });
});

describe('getServeMeasuring', () => {
  it('should collect metrics', async () => {
    const config: BaseConfig = { env: 'test', appName: 'testApp', appVersion: 'testVer' };
    const middleware = getServeMeasuring(config);
    const events = new EventTarget();

    expect(async () => {
      await middleware(
        new Request('http://test.com'),
        () => {
          events.dispatchEvent(new Event(RESPONSE_EVENT_TYPE.renderStart));
          events.dispatchEvent(new Event(RESPONSE_EVENT_TYPE.renderFinish));
          return Promise.resolve<Response>(new Response('OK'));
        },
        {
          events,
        },
      );
    }).not.toThrow();
  });
});

describe('getFetchTracing', () => {
  it('should trace fetch stages', async () => {
    const tracer: any = {
      startSpan: jest.fn(() => ({
        setAttributes: jest.fn(),
        setStatus: jest.fn(),
        end: jest.fn(),
      })),
    };
    const context: any = {};
    const middleware = getFetchTracing(tracer, context);

    const request = new Request('http://test.com/api/v2/product/1005002');

    expect(
      await Promise.resolve(
        middleware(request, () => Promise.resolve<Response>(new Response('OK'))),
      ).catch(() => 'catch!'),
    ).not.toBe('catch!');
  });

  it('should handle error', async () => {
    const tracer: any = {
      startSpan: jest.fn(() => ({
        setAttributes: jest.fn(),
        setStatus: jest.fn(),
        end: jest.fn(),
      })),
    };
    const context: any = {};
    const middleware = getFetchTracing(tracer, context);

    const request = new Request('http://test.com/api/v2/product/1005002');

    expect(
      await Promise.resolve(middleware(request, () => Promise.reject('FAKE ERROR'))).catch(e => e),
    ).toBe('FAKE ERROR');
  });
});

describe('applyServerMiddleware', () => {
  it('should compose middleware', async () => {
    const log: string[] = [];

    const foo: ServerMiddleware = async (request, next) => {
      log.push('<foo>');
      const result = await next(request);
      log.push('</foo>');
      return result;
    };

    const bar: ServerMiddleware = async (request, next) => {
      log.push('<bar>');
      const result = await next(request);
      log.push('</bar>');
      return result;
    };

    const baz: ServerMiddleware = async (request, next) => {
      log.push('<baz>');
      const result = await next(request);
      log.push('</baz>');
      return result;
    };

    const enhancer = applyServerMiddleware(foo, bar, baz);

    const handler = enhancer(() => {
      log.push('<handler />');
      return new Response('Test');
    });

    await handler(new Request('http://test.com'), { events: new EventTarget() });

    expect(log).toEqual([
      // expected log
      '<foo>',
      '<bar>',
      '<baz>',
      '<handler />',
      '</baz>',
      '</bar>',
      '</foo>',
    ]);
  });
});
