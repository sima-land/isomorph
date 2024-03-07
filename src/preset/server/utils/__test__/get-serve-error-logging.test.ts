import { DetailedError, createLogger } from '../../../../log';
import { getServeErrorLogging } from '../get-serve-error-logging';

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
