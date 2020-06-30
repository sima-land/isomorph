import createTraceRequestMiddleware from '../trace-request-middleware';
import { Tags } from 'opentracing';
import { testSpan, tracer } from '../../../../../__mocks__/jaeger-client';

describe('createTraceRequestMiddleware', () => {
  it('creates function for start tracing of API request', () => {
    expect(createTraceRequestMiddleware({}, {})).toBeInstanceOf(Function);
  });

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
      };
      await instance(requestConfig, next);
      expect(tracer.startSpan).toHaveBeenCalledWith('HTTP GET test.ru/test/url', {
        childOf: context,
      });
      expect(tracer.inject(testSpan, 'test', requestConfig.headers)).toEqual({
        testHeader: 'test',
        tracerId: 'test',
      });
      expect(testSpan.setTag).toHaveBeenCalledWith(Tags.HTTP_URL, 'test.ru/test/url');
      expect(testSpan.setTag).toHaveBeenCalledWith(Tags.HTTP_METHOD, 'GET');
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
});
