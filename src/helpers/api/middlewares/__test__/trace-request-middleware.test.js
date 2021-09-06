import createTraceRequestMiddleware, { hideFirstId } from '../trace-request-middleware';
import { Tags } from 'opentracing';
import { testSpan, tracer } from '../../../../../__mocks__/jaeger-client';

describe('createTraceRequestMiddleware', () => {
  describe('function for start tracing of API request', () => {
    const context = {
      test: true,
    };
    const next = jest.fn(() => ({ status: 200 }));
    const instance = createTraceRequestMiddleware({ context, tracer });

    it('finish request trace ', async () => {
      const requestConfig = {
        baseURL: 'test.ru',
        url: '/test/url',
        method: 'get',
        headers: {
          testHeader: 'test',
        },
        params: { testParam: 'test' },
      };
      await instance(requestConfig, next);
      expect(tracer.startSpan).toHaveBeenCalledWith('HTTP GET test.ru/test/url', {
        childOf: context,
      });
      expect(tracer.inject(testSpan, 'test', requestConfig.headers)).toEqual({
        testHeader: 'test',
        tracerId: 'test',
      });
      expect(testSpan.addTags).toHaveBeenCalledWith({
        [Tags.HTTP_URL]: 'test.ru/test/url',
        [Tags.HTTP_METHOD]: 'GET',
        'request.params': { testParam: 'test' },
        'request.headers': { testHeader: 'test' },
      });
      expect(testSpan.setTag).toHaveBeenCalledWith(Tags.HTTP_STATUS_CODE, 200);
      expect(next).toHaveBeenCalledWith(requestConfig);
    });

    it('finish request trace, when not headers', async () => {
      const requestConfig = {
        baseURL: 'test.ru',
        url: '/test/url',
        method: 'get',
      };
      await instance(requestConfig, next);
      expect(tracer.inject(testSpan, 'test', requestConfig.headers)).toEqual({
        tracerId: 'test',
      });
    });
  });

  it('should replace ids from url to template parts', async () => {
    const startedSpan = {
      addTags: jest.fn(),
      setTag: jest.fn(),
      finish: jest.fn(),
    };

    const fakeTracer = {
      startSpan: jest.fn(() => startedSpan),
      inject: jest.fn(),
    };

    const middleware = createTraceRequestMiddleware({
      tracer: fakeTracer,
      context: { mock: true },
    });

    expect(fakeTracer.startSpan).toBeCalledTimes(0);

    await middleware({
      method: 'PUT',
      baseURL: 'www.sima-land.ru/',
      url: 'api/v2/something/123456/some-bff/123456',
    }, () => ({ status: 200 }));

    expect(fakeTracer.startSpan).toBeCalledTimes(1);
    expect(fakeTracer.startSpan.mock.calls[0][0])
      .toBe('HTTP PUT www.sima-land.ru/api/v2/something/{id}/some-bff/123456');
  });

  it('should replace ids from url to template parts (without specified method)', async () => {
    const startedSpan = {
      addTags: jest.fn(),
      setTag: jest.fn(),
      finish: jest.fn(),
    };

    const fakeTracer = {
      startSpan: jest.fn(() => startedSpan),
      inject: jest.fn(),
    };

    const middleware = createTraceRequestMiddleware({
      tracer: fakeTracer,
      context: { mock: true },
    });

    expect(fakeTracer.startSpan).toBeCalledTimes(0);

    await middleware({
      method: undefined,
      baseURL: 'foo-bar-2112.sima-land.ru/',
      url: 'api/v2/something/123456/some-bff/123456',
    }, () => ({ status: 200 }));

    expect(fakeTracer.startSpan).toBeCalledTimes(1);
    expect(fakeTracer.startSpan.mock.calls[0][0])
      .toBe('HTTP GET foo-bar-2112.sima-land.ru/api/v2/something/{id}/some-bff/123456');
  });

  it('should handle url/baseURL missing in config/defaults', async () => {
    const startedSpan = {
      addTags: jest.fn(),
      setTag: jest.fn(),
      finish: jest.fn(),
    };

    const fakeTracer = {
      startSpan: jest.fn(() => startedSpan),
      inject: jest.fn(),
    };

    const middleware = createTraceRequestMiddleware({
      tracer: fakeTracer,
      context: { mock: true },
    });

    expect(fakeTracer.startSpan).toBeCalledTimes(0);

    await middleware({
      method: undefined,
      baseURL: undefined,
      url: undefined,
    }, () => ({ status: 200 }), {
      baseURL: undefined,
      url: undefined,
    });

    expect(fakeTracer.startSpan).toBeCalledTimes(1);
    expect(fakeTracer.startSpan.mock.calls[0][0])
      .toBe('HTTP GET ');
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
