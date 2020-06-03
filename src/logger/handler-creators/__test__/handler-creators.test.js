import { createSentryHandlerForSagas, createSentryHandlerForStore } from '../index';

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

describe('createSentryHandlerForStore', () => {
  const captureException = jest.fn();
  const dependencies = {
    sentry: {
      captureException,
    },
  };
  const handler = createSentryHandlerForStore(dependencies);

  it('should create handler', () => {
    expect(handler).toBeInstanceOf(Function);
    expect(handler).toHaveLength(0);
  });

  it('handler should work correctly', () => {
    handler();
    expect(captureException.mock.calls[0][0].message)
      .toEqual('Ожидание готовности store было прервано по таймауту');
  });
});
