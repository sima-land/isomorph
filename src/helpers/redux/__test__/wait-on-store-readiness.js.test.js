import waitOnStoreReadiness from '../wait-on-store-readiness';
import { createStore } from 'redux';

jest.unmock('redux');
jest.useFakeTimers();

describe('function waitOnReadiness', () => {
  const store = createStore((state, { ready = false }) => ({ ...state, ready }), { ready: false });
  const subscribe = store.subscribe;
  let unsubscribe;
  store.subscribe = jest.fn((...args) => {
    unsubscribe = jest.fn(subscribe(...args));
    return unsubscribe;
  });
  const isReady = jest.fn(testStore => testStore.getState().ready);
  const onReady = jest.fn();
  const onTimeout = jest.fn();

  // временно, https://github.com/facebook/jest/issues/11500
  beforeAll(() => {
    jest.spyOn(global, 'setTimeout');
    jest.spyOn(global, 'clearTimeout');
  });
  afterAll(() => {
    global.setTimeout.mockRestore();
    global.clearTimeout.mockRestore();
  });

  it('subscribes to the store and waits for its readiness', () => {
    expect(store.subscribe).not.toHaveBeenCalled();
    expect(waitOnStoreReadiness(store, isReady, onReady, onTimeout, 500)).toEqual(store);
    expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function));
    expect(isReady).not.toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 500);
    expect(setTimeout).toHaveReturnedWith(expect.any(Number));
    store.dispatch({ type: 'TEST' });
    expect(isReady).toHaveBeenCalledWith(store);
    expect(isReady).toHaveReturnedWith(false);
    expect(onReady).not.toHaveBeenCalled();
    expect(clearTimeout).not.toHaveBeenCalled();
    store.dispatch({ type: 'TEST', ready: true });
    expect(isReady).toHaveReturnedWith(true);
    expect(onReady).toHaveBeenCalledWith(store);
    expect(unsubscribe).toHaveBeenCalled();
    expect(clearTimeout).toHaveBeenCalledWith(setTimeout.mock.results[0].value);
    expect(onTimeout).not.toBeCalled();
  });

  it('subscribes to the store and stops waiting its readiness by timeout', () => {
    expect(store.subscribe).not.toHaveBeenCalled();
    expect(waitOnStoreReadiness(store, isReady, onReady, onTimeout)).toEqual(store);
    expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function));
    expect(isReady).not.toHaveBeenCalled();
    expect(onTimeout).not.toBeCalled();
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 2 ** 30);
    expect(setTimeout).toHaveReturnedWith(expect.any(Number));
    expect(clearTimeout).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(unsubscribe).toHaveBeenCalled();
    expect(onReady).toHaveBeenCalled();
    expect(onTimeout).toBeCalledWith(store);
    expect(clearTimeout).not.toHaveBeenCalled();
  });
});
