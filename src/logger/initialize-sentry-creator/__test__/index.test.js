import initializeSentryCreator from '..';
import Raven from '../../../../__mocks__/raven';

describe('initializeSentry()', () => {
  it('should throw type error when getSentryDsn is not a function', function () {
    expect(initializeSentryCreator({
      sentryLoggerService: Raven,
      getSentryDsn: {},
    })).toThrow('"getSentryDsn" must be a function');
  });
  it('should throw type error when getSentryOptions is not a function', function () {
    expect(initializeSentryCreator({
      sentryLoggerService: Raven,
      getSentryDsn: jest.fn(),
      getSentryOptions: {},
    })).toThrow('"getSentryOptions" must be a function');
  });

  it('should configure sentry', () => {
    const sentry = initializeSentryCreator({
      sentryLoggerService: Raven,
      getSentryDsn: () => 'testDSN',
      getSentryOptions: () => ({ version: 'test' }),
    });
    sentry();
    expect(Raven.config).toHaveBeenCalledWith('testDSN', { version: 'test' });
    expect(Raven.install).toHaveBeenCalled();
  });

  it('should configure sentry when getters return undefined', () => {
    const sentry = initializeSentryCreator({
      sentryLoggerService: Raven,
      getSentryDsn: () => undefined,
      getSentryOptions: () => undefined,
    });
    sentry();
    expect(Raven.config).toHaveBeenCalledWith('', {});
    expect(Raven.install).toHaveBeenCalled();
  });
});
