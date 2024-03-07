import { getFetchErrorLogging } from '../get-fetch-error-logging';

describe('getFetchErrorLogging', () => {
  it('should log only catch stage', async () => {
    const requestSpy = jest.fn();
    const responseSpy = jest.fn();
    const catchSpy = jest.fn();

    const middleware = getFetchErrorLogging({
      onRequest: requestSpy,
      onResponse: responseSpy,
      onCatch: catchSpy,
    });

    await Promise.resolve(
      middleware(new Request('http://test.com'), () => Promise.reject('FAKE ERROR')),
    ).catch(() => {});

    expect(requestSpy).toHaveBeenCalledTimes(0);
    expect(responseSpy).toHaveBeenCalledTimes(0);
    expect(catchSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle function as handlerInit', async () => {
    const requestSpy = jest.fn();
    const responseSpy = jest.fn();
    const catchSpy = jest.fn();

    const middleware = getFetchErrorLogging(() => ({
      onRequest: requestSpy,
      onResponse: responseSpy,
      onCatch: catchSpy,
    }));

    await Promise.resolve(
      middleware(new Request('http://test.com'), () => Promise.reject('FAKE ERROR')),
    ).catch(() => {});

    expect(requestSpy).toHaveBeenCalledTimes(0);
    expect(responseSpy).toHaveBeenCalledTimes(0);
    expect(catchSpy).toHaveBeenCalledTimes(1);
  });
});
