import storeCreator from './';
import { createStore, applyMiddleware } from '../../__mocks__/redux';

describe('function storeCreator()', () => {
  test('stoneCreator() works properly', () => {
    const compose = jest.fn(arg => arg);
    const reducer = jest.fn();
    storeCreator({
      initialState: {},
      reducer,
      middleware: {},
      compose,
    });
    expect(createStore).toHaveBeenCalledWith(reducer, {}, 1);
    expect(applyMiddleware).toHaveBeenCalledWith({});
    expect(compose).toHaveBeenCalledWith(1);
  });
});
