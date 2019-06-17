import storeCreator from './';
import { createStore, applyMiddleware } from '../../__mocks__/redux';

describe('function storeCreator()', () => {
  it('storeCreator() works properly', () => {
    const compose = jest.fn(arg => arg);
    const reducer = jest.fn();
    storeCreator({
      initialState: {},
      reducer,
      middleware: [],
      compose,
    });
    expect(createStore).toHaveBeenCalledWith(reducer, {}, 1);
    expect(applyMiddleware).toHaveBeenCalledWith([]);
    expect(compose).toHaveBeenCalledWith(1);
  });

  it('storeCreator() works properly with default compose', () => {
    const reducer = jest.fn();
    storeCreator({
      initialState: {},
      reducer,
      middleware: [],
    });
    expect(createStore).toHaveBeenCalledWith(reducer, {}, 1);
    expect(applyMiddleware).toHaveBeenCalledWith([]);
  });
});
