import { createLogger } from '../../../../log';
import { getServeLogging } from '../get-serve-logging';

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
