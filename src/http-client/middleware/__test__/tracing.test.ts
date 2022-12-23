import { Context } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { Span, Tracer } from '@opentelemetry/sdk-trace-base';
import { tracingMiddleware, getRequestInfo, hideFirstId } from '../tracing';

describe('tracingMiddleware', () => {
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

    const middleware = tracingMiddleware(tracer, context);

    expect(currentSpan).toBe(null);

    const config = { url: '/api/v3/something' };
    const next = () => Promise.resolve<any>({ ok: true, data: {} });
    const defaults = { baseURL: 'https://www.test.com/', headers: {} as any };
    await middleware(config, next, defaults);

    expect(currentSpan.setAttributes).toBeCalledTimes(1);
    expect(currentSpan.end).toBeCalledTimes(1);
    expect(currentSpan.setStatus).toBeCalledTimes(0);
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

    const middleware = tracingMiddleware(tracer, context);

    expect(currentSpan).toBe(null);

    const config = { url: '/api/v3/12341241/something' };
    const next = () => Promise.reject<any>({ ok: false, data: {} });
    const defaults = { baseURL: 'https://www.test.com/', headers: {} as any };

    await middleware(config, next, defaults).catch(() => Promise.resolve());

    expect(currentSpan.setAttributes).toBeCalledTimes(1);
    expect(currentSpan.setAttributes).toBeCalledWith({
      [SemanticAttributes.HTTP_URL]: 'https://www.test.com/api/v3/{id}/something',
      [SemanticAttributes.HTTP_METHOD]: 'GET',
      'request.params': JSON.stringify({}),
      'request.headers': JSON.stringify({}),
      'request.id': 12341241,
    });
    expect(currentSpan.end).toBeCalledTimes(1);
    expect(currentSpan.setStatus).toBeCalledTimes(1);
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
