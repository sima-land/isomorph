import createSentryMiddleware from './index';
import Raven from '../../../__mocks__/raven';

describe('createSentryMiddleware()', () => {
  it('works correctly', () => {
    const config = {
      sentryDsnServer: null,
      version: 'test',
      sentryOptions: {
        test: test,
      },
    };

    createSentryMiddleware({ config });

    expect(Raven.config).toHaveBeenCalledWith(config.sentryDsnServer, {
      version: 'test',
      ...config.sentryOptions,
    });
    expect(Raven.install).toHaveBeenCalled();
    expect(Raven.requestHandler).toHaveBeenCalled();
  });
});
