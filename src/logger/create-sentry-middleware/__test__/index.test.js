import createSentryMiddleware from '..';
import Raven from '../../../../__mocks__/raven';

describe('createSentryMiddleware()', () => {
  it('works correctly', () => {
    const config = {
      sentryDsnServer: null,
      sentryOptions: {
        version: 'test',
        test: test,
      },
    };

    createSentryMiddleware({ config });

    expect(Raven.config).toHaveBeenCalledWith(config.sentryDsnServer, {
      ...config.sentryOptions,
    });
    expect(Raven.install).toHaveBeenCalled();
    expect(Raven.errorHandler).toHaveBeenCalled();
  });
});
