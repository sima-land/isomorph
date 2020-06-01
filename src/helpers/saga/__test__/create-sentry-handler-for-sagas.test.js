import createSentryHandlerForSagas from '../create-sentry-handler-for-sagas';

describe('createSentryHandlerForSagas', () => {
  const captureExtendedException = jest.fn();
  const dependencies = {
    sentry: {
      captureExtendedException,
    },
  };
  const handler = createSentryHandlerForSagas(dependencies);

  it('should create handler', () => {
    expect(handler).toBeInstanceOf(Function);
    expect(handler).toHaveLength(2);
  });

  it('handler should work correctly', () => {
    const error = new Error('test error');
    handler(error, { sagaStack: 'test_stack' });
    expect(captureExtendedException).toHaveBeenCalledWith(error, 'test_stack', 'Sagas stack');
  });
});
