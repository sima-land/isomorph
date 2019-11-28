import initializeSentryCreator from '..';
import Raven from '../../../../__mocks__/raven';

describe('initializeSentry()', () => {
  it('works correctly', () => {
    const config = {
      sentryDsnServer: null,
      sentryOptions: {
        version: 'test',
        test,
      },
    };

    const sentry = initializeSentryCreator({ sentryLoggerService: Raven, config });
    sentry();
    expect(Raven.config).toHaveBeenCalledWith(config.sentryDsnServer, {
      ...config.sentryOptions,
    });
    expect(Raven.install).toHaveBeenCalled();
  });
});
