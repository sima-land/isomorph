import storeCreator from '..';
import { createStore, applyMiddleware, middlewares } from '../../../__mocks__/redux';

describe('function storeCreator()', () => {
  it('storeCreator() returns object when it receives incorrect arguments', () => {
    storeCreator({
      compose: 123,
      reducer: '123',
      getAppRunner: 321,
    });
    expect(createStore).not.toHaveBeenCalled();
    expect(applyMiddleware).not.toHaveBeenCalled();
    expect(storeCreator(compose, reducer, getAppRunner)).toEqual({});
  });

  const reducer = jest.fn();
  const compose = jest.fn(arg => arg);
  const getAppRunner = jest.fn(jest.fn(() => {}));
  it('storeCreator() works properly', () => {
    storeCreator({
      initialState: {},
      reducer,
      middlewares: middlewares,
      compose,
      getAppRunner,
    });
    expect(createStore).toHaveBeenCalledWith(reducer, {}, middlewares);
    expect(compose).toHaveBeenCalledWith(middlewares);
    expect(getAppRunner).toHaveBeenCalledWith(middlewares);
    expect(applyMiddleware).toHaveBeenCalled();
  });

  it('storeCreator() works properly with default options', () => {
    storeCreator({
      compose,
      reducer,
      getAppRunner,
    });
    expect(createStore).toHaveBeenCalledWith(reducer, {}, middlewares);
    expect(compose).toHaveBeenCalledWith(middlewares);
    expect(getAppRunner).toHaveBeenCalledWith({});
    expect(applyMiddleware).toHaveBeenCalled();
  });
});
