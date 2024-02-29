import { Context } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { Span, Tracer } from '@opentelemetry/sdk-trace-base';
import { axiosTracingMiddleware, getRequestInfo, hideFirstId, getForwardedHeaders } from '..';
import { BaseConfig } from '../../../../../../config';
import { Request } from 'express';

describe('axiosTracingMiddleware', () => {
  it('should handle success response', async () => {
    let currentSpan: Span = null as any;

    const tracer: Tracer = {
      startSpan: jest.fn(() => {
        const span: Span = {
          setAttributes: jest.fn(),
          setStatus: jest.fn(),
          end: jest.fn(),
        } as any;

        currentSpan = span;

        return span;
      }),
    } as any;

    const context: Context = {} as any;

    const middleware = axiosTracingMiddleware(tracer, context);

    expect(currentSpan).toBe(null);

    const config = { url: '/api/v3/something' };
    const next = () => Promise.resolve<any>({ ok: true, data: {} });
    const defaults = { baseURL: 'https://www.test.com/', headers: {} as any };
    await middleware(config, next, defaults);

    expect(currentSpan.setAttributes).toHaveBeenCalledTimes(1);
    expect(currentSpan.end).toHaveBeenCalledTimes(1);
    expect(currentSpan.setStatus).toHaveBeenCalledTimes(0);
  });

  it('should handle failure response', async () => {
    let currentSpan: Span = null as any;

    const tracer: Tracer = {
      startSpan: jest.fn(() => {
        const span: Span = {
          setAttributes: jest.fn(),
          setStatus: jest.fn(),
          end: jest.fn(),
        } as any;

        currentSpan = span;

        return span;
      }),
    } as any;

    const context: Context = {} as any;

    const middleware = axiosTracingMiddleware(tracer, context);

    expect(currentSpan).toBe(null);

    const config = { url: '/api/v3/12341241/something' };
    const next = () => Promise.reject<any>({ ok: false, data: {} });
    const defaults = { baseURL: 'https://www.test.com/', headers: {} as any };

    await middleware(config, next, defaults).catch(() => Promise.resolve());

    expect(currentSpan.setAttributes).toHaveBeenCalledTimes(1);
    expect(currentSpan.setAttributes).toHaveBeenCalledWith({
      [SemanticAttributes.HTTP_URL]: 'https://www.test.com/api/v3/{id}/something',
      [SemanticAttributes.HTTP_METHOD]: 'GET',
      'request.params': JSON.stringify({}),
      'request.headers': JSON.stringify({}),
      'request.id': 12341241,
    });
    expect(currentSpan.end).toHaveBeenCalledTimes(1);
    expect(currentSpan.setStatus).toHaveBeenCalledTimes(1);
  });
});

describe('getRequestInfo', () => {
  it('should properly merge baseURL with url', () => {
    const cases: Array<{ url: string; baseURL: string; expectedUrl: string }> = [
      // baseURL и url
      {
        baseURL: 'https://www.base.com/',
        url: '/user/current',
        expectedUrl: 'https://www.base.com/user/current',
      },
      {
        baseURL: 'https://www.base.com',
        url: 'user/current',
        expectedUrl: 'https://www.base.com/user/current',
      },
      {
        baseURL: 'https://www.base.com',
        url: '/user/current',
        expectedUrl: 'https://www.base.com/user/current',
      },
      {
        baseURL: 'https://www.base.com/',
        url: 'admin/all',
        expectedUrl: 'https://www.base.com/admin/all',
      },

      // только baseURL
      {
        baseURL: 'www.test.com',
        url: '',
        expectedUrl: 'www.test.com',
      },
      {
        baseURL: 'www.test.com/',
        url: '',
        expectedUrl: 'www.test.com/',
      },

      // только url
      {
        baseURL: '',
        url: '/hello/world',
        expectedUrl: '/hello/world',
      },
      {
        baseURL: '',
        url: 'some/path',
        expectedUrl: 'some/path',
      },

      // ничего
      {
        baseURL: '',
        url: '',
        expectedUrl: '[empty]',
      },
    ];

    for (const { baseURL, url, expectedUrl } of cases) {
      expect(getRequestInfo({ url }, { baseURL, headers: null as any }).url).toBe(expectedUrl);
    }
  });
});

describe('hideFirstId', () => {
  const cases = [
    {
      input: '/api/v2/something/123456/some-bff/123456',
      output: ['/api/v2/something/{id}/some-bff/123456', 123456],
    },
    {
      input: '/api/v2/something/222/some-bff/333',
      output: ['/api/v2/something/{id}/some-bff/333', 222],
    },
    {
      input: '/api/v2/something/45320/some-bff',
      output: ['/api/v2/something/{id}/some-bff', 45320],
    },
  ];

  it('should replace first id only', () => {
    cases.forEach(({ input, output }) => {
      expect(hideFirstId(input)).toEqual(output);
    });
  });
});

describe('getRequestHeaders', () => {
  it('should return headers', () => {
    const config: BaseConfig = {
      appName: 'foo',
      appVersion: '0.0.1',
      env: 'test',
    };

    const request: Request = {
      socket: {
        remoteAddress: '127.0.0.1',
      },
      headers: {
        cookie: 'userid=12345',
        'simaland-a': 'aaa',
        'simaland-b': 'bbb',
      },
      get(key: string) {
        return this.headers[key];
      },
      header(key: string) {
        return this.headers[key];
      },
    } as any;

    const result = getForwardedHeaders(config, request);

    expect(result).toEqual({
      'X-Client-Ip': '127.0.0.1',
      'User-Agent': `simaland-foo/0.0.1`,
      Cookie: 'userid=12345',
      'simaland-a': 'aaa',
      'simaland-b': 'bbb',
    });
  });

  it('should return headers when lot of data is undefined', () => {
    const config: BaseConfig = {
      appName: 'foo',
      appVersion: '0.0.1',
      env: 'test',
    };

    const request: Request = {
      socket: {
        remoteAddress: undefined,
      },
      headers: {},
      get(key: string) {
        return this.headers[key];
      },
      header(key: string) {
        return this.headers[key];
      },
    } as any;

    const result = getForwardedHeaders(config, request);

    expect(result).toEqual({
      'User-Agent': `simaland-foo/0.0.1`,
    });
  });
});
