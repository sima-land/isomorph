import createSentryMiddleware from '..';
import { Handlers } from '@sentry/node';

jest.mock('@sentry/node', () => {
  const original = jest.requireActual('@sentry/node');
  original.Handlers.errorHandler = jest.fn();
  return original;
});

describe('createSentryMiddleware()', () => {
  it('works correctly', () => {
    createSentryMiddleware();
    expect(Handlers.errorHandler).toHaveBeenCalled();
  });
});
