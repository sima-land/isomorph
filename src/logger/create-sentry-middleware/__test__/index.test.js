import createSentryMiddleware from '..';
import Raven from '../../../../__mocks__/raven';

describe('createSentryMiddleware()', () => {
  it('works correctly', () => {
    createSentryMiddleware();
    expect(Raven.errorHandler).toHaveBeenCalled();
  });
});
