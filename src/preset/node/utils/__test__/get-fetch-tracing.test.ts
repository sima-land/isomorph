import { getFetchTracing } from '../get-fetch-tracing';

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
