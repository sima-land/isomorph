import { getFetchExtraAborting } from '../get-fetch-extra-aborting';

describe('getFetchExtraAborting', () => {
  it('should handle controller', async () => {
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    const middleware = getFetchExtraAborting(controller1);

    let request = new Request('http://stub.com');

    await middleware(new Request('http://test.com', { signal: controller2.signal }), req => {
      request = req;
      return Promise.resolve<Response>(new Response('OK'));
    });

    expect(request.signal.aborted).toBe(false);

    controller1.abort();
    expect(request.signal.aborted).toBe(true);
  });

  it('should handle controller from request', async () => {
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    const middleware = getFetchExtraAborting(controller1);

    let request = new Request('http://stub.com');

    await middleware(new Request('http://test.com', { signal: controller2.signal }), req => {
      request = req;
      return Promise.resolve<Response>(new Response('OK'));
    });

    expect(request.signal.aborted).toBe(false);

    controller2.abort();
    expect(request.signal.aborted).toBe(true);
  });
});
