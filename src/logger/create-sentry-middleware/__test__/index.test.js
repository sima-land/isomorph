import { createSentryMiddleware } from '..';
import { Handlers } from '@sentry/node';

jest.mock('@sentry/node', () => {
  const original = jest.requireActual('@sentry/node');
  original.Handlers.errorHandler = jest.fn().mockReturnValue('fakeErrorHandlerMiddleware');
  original.Handlers.requestHandler = jest.fn().mockReturnValue('fakeRequestHandlerMiddleware');
  return original;
});

describe('createSentryMiddleware()', () => {
  it('works correctly', () => {
    const middleware = createSentryMiddleware();
    expect(Handlers.errorHandler).toHaveBeenCalled();
    expect(middleware).toEqual({
      request: 'fakeRequestHandlerMiddleware',
      failure: 'fakeErrorHandlerMiddleware',
    });
  });
});
