import initializeSentryCreator from '..';
import Sentry from '../../../../__mocks__/sentry';

describe('initializeSentry()', () => {
  it('should throw type error when getSentryDsn is not a function', function () {
    expect(initializeSentryCreator({
      sentryLoggerService: Sentry,
      getSentryDsn: {},
    })).toThrow('"getSentryDsn" must be a function');
  });
  it('should throw type error when getSentryOptions is not a function', function () {
    expect(initializeSentryCreator({
      sentryLoggerService: Sentry,
      getSentryDsn: jest.fn(),
      getSentryOptions: {},
    })).toThrow('"getSentryOptions" must be a function');
  });

  it('should configure sentry', () => {
    const sentry = initializeSentryCreator({
      sentryLoggerService: Sentry,
      getSentryDsn: () => 'testDSN',
      getSentryOptions: () => ({ release: 'test' }),
    });
    sentry();
    expect(Sentry.init).toHaveBeenCalledWith({ dsn: 'testDSN', release: 'test' });
  });

  it('should configure sentry when getters return undefined', () => {
    const sentry = initializeSentryCreator({
      sentryLoggerService: Sentry,
      getSentryDsn: () => undefined,
      getSentryOptions: () => undefined,
    });
    sentry();
    expect(Sentry.init).toHaveBeenCalledWith({ dsn: '' });
  });
});
