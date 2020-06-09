import initializeSentryCreator from '..';
import Sentry from '../../../../__mocks__/sentry';

describe('initializeSentry()', () => {
  it('should throw type error when getSentryDsn is not a function', function () {
    expect(initializeSentryCreator({
      sentryLoggerService: Sentry,
      getSentryDsn: {},
    })).toThrow('"getSentryDsn" must be a function');
  });
  it('should throw type error when getSentryOptions is not a function and defined', function () {
    expect(initializeSentryCreator({
      sentryLoggerService: Sentry,
      getSentryDsn: jest.fn(),
      getSentryOptions: {},
    })).toThrow('"getSentryOptions" must be a function');
  });
  it('should throw type error when configureMainScope is not a function and defined', function () {
    expect(initializeSentryCreator({
      sentryLoggerService: Sentry,
      getSentryDsn: jest.fn(),
      configureMainScope: {},
    })).toThrow('"configureMainScope" must be a function');
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

  it('should configure scope', () => {
    const configureMainScope = jest.fn();
    const sentry = initializeSentryCreator({
      sentryLoggerService: Sentry,
      getSentryDsn: () => 'testDSN',
      configureMainScope,
    });
    sentry();
    expect(Sentry.configureScope).toHaveBeenCalledWith(configureMainScope);
  });

  it('shouldn`t configure scope if configureMainScope not a function', () => {
    const sentry = initializeSentryCreator({
      sentryLoggerService: Sentry,
      getSentryDsn: () => 'testDSN',
      configureMainScope: null,
    });
    sentry();
    expect(Sentry.configureScope).not.toBeCalled();
  });

  it('shouldn`t throw error if configureScope method not defined in Sentry instance', () => {
    const sentry = initializeSentryCreator({
      sentryLoggerService: { ...Sentry, configureScope: null },
      getSentryDsn: () => 'testDSN',
      configureMainScope: jest.fn(),
    });
    expect(sentry).not.toThrowError();
  });
});
