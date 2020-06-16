import {
  createSentryHandlerForSagas,
  createSentryHandlerForStore,
  createDefaultScopeConfigurator,
} from '../index';

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
    expect(captureExtendedException).toHaveBeenCalledWith(error, 'test_stack', { dataName: 'Sagas stack' });
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

describe('createDefaultScopeConfigurator', () => {
  const testConfig = 'test_config';
  const instance = createDefaultScopeConfigurator({ config: testConfig });

  it('should create function', () => {
    expect(instance).toBeInstanceOf(Function);
    expect(instance).toHaveLength(1);
  });

  it('instance should call setContext', () => {
    const setContext = jest.fn();
    const testScope = {
      setContext,
    };

    expect(setContext).not.toBeCalled();
    instance(testScope);
    expect(setContext).toBeCalledWith('App config', testConfig);
  });
});
