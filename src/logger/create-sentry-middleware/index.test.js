import createSentryMiddleware from './index';
import Raven from '../../../__mocks__/raven';

describe('createSentryMiddleware()', () => {
  it('works correctly', () => {
    const config = {
      sentryDsnServer: {},
      release: 'test',
      sentryOptions: {},
    };

    createSentryMiddleware({ config });

    expect(Raven.config).toHaveBeenCalled();
    expect(Raven.install).toHaveBeenCalled();
    expect(Raven.requestHandler).toHaveBeenCalled();
  });
});
