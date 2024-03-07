import { getFetchLogging } from '../get-fetch-logging';

describe('getFetchLogging', () => {
  it('should log only request and response', async () => {
    const requestSpy = jest.fn();
    const responseSpy = jest.fn();
    const catchSpy = jest.fn();

    const middleware = getFetchLogging({
      onRequest: requestSpy,
      onResponse: responseSpy,
      onCatch: catchSpy,
    });

    await middleware(new Request('http://test.com'), () =>
      Promise.resolve<Response>(new Response('OK')),
    );

    expect(requestSpy).toHaveBeenCalledTimes(1);
    expect(responseSpy).toHaveBeenCalledTimes(1);
    expect(catchSpy).toHaveBeenCalledTimes(0);
  });

  it('should handle function as handlerInit', async () => {
    const requestSpy = jest.fn();
    const responseSpy = jest.fn();
    const catchSpy = jest.fn();

    const middleware = getFetchLogging(() => ({
      onRequest: requestSpy,
      onResponse: responseSpy,
      onCatch: catchSpy,
    }));

    await middleware(new Request('http://test.com'), () =>
      Promise.resolve<Response>(new Response('OK')),
    );

    expect(requestSpy).toHaveBeenCalledTimes(1);
    expect(responseSpy).toHaveBeenCalledTimes(1);
    expect(catchSpy).toHaveBeenCalledTimes(0);
  });
});
