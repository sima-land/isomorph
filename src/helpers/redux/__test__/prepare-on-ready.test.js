import prepareOnReady from '../prepare-on-ready';
import isFunction from 'lodash.isfunction';

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
