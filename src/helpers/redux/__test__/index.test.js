import { waitOnStoreReadiness, prepareOnReady } from '../index';
import { createStore } from 'redux';
import isFunction from 'lodash/isFunction';

jest.unmock('redux');
jest.useFakeTimers();

describe('function prepareOnReady', () => {
  const store = {};
  const unsubscribe = jest.fn();
  const onReady = jest.fn();
  it('creates handler which unsubscribe, clears timeout and invoke specified callback', () => {
    const handler = prepareOnReady(store, unsubscribe, onReady);
    expect(unsubscribe).not.toHaveBeenCalled();
    expect(onReady).not.toHaveBeenCalled();
    expect(clearTimeout).not.toHaveBeenCalled();
    handler(123456);
    expect(unsubscribe).toHaveBeenCalled();
    expect(onReady).toHaveBeenCalledWith(store);
    expect(clearTimeout).toHaveBeenCalledWith(123456);
  });
  it('creates handler which does not invoke clearTimeout '
    + 'if identifier of timeout has not been passed on calling', () => {
    const handler = prepareOnReady(store, unsubscribe, 'i am not a function');
    expect(clearTimeout).not.toHaveBeenCalled();
    handler(123456);
    expect(clearTimeout).toHaveBeenCalledWith(123456);
  });
  it('creates handler which does not invoke specified callback '
    + 'if it has not been passed on creation or it is not a function', () => {
    const handler = prepareOnReady(store, unsubscribe, 'i am not a function');
    expect(isFunction).not.toHaveBeenCalled();
    handler(123456);
    expect(isFunction).toHaveBeenCalledWith('i am not a function');
    expect(isFunction).toHaveReturnedWith(false);
  });
});

describe('function waitOnReadiness', () => {
  const store = createStore((state, { ready = false }) => ({ ...state, ready }), { ready: false });
  const subscribe = store.subscribe;
  let unsubscribe;
  store.subscribe = jest.fn((...args) => {
    unsubscribe = jest.fn(subscribe(...args));
    return unsubscribe;
  });
  const isReady = jest.fn(store => store.getState().ready);
  const onReady = jest.fn();
  it('subscribes to the store and waits for its readiness', () => {
    expect(store.subscribe).not.toHaveBeenCalled();
    expect(waitOnStoreReadiness(store, isReady, onReady, 500)).toEqual(store);
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
  });
  it('subscribes to the store and stops waiting its readiness by timeout', () => {
    expect(store.subscribe).not.toHaveBeenCalled();
    expect(waitOnStoreReadiness(store, isReady, onReady)).toEqual(store);
    expect(store.subscribe).toHaveBeenCalledWith(expect.any(Function));
    expect(isReady).not.toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 2 ** 30);
    expect(setTimeout).toHaveReturnedWith(expect.any(Number));
    expect(clearTimeout).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(unsubscribe).toHaveBeenCalled();
    expect(onReady).toHaveBeenCalled();
    expect(clearTimeout).not.toHaveBeenCalled();
  });
});
