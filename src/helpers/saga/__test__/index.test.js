import { createSagaReadyHandler, createStore, mapServiceOptionsToArgs } from '../index';
import { createStore as createReduxStore } from 'redux';
import { call } from 'redux-saga/effects';
import { END } from 'redux-saga';
import isFunction from 'lodash/isFunction';
import { waitOnStoreReadiness } from '../../redux';

jest.mock('redux', () => {
  const original = jest.requireActual('redux');
  return {
    ...original,
    createStore: jest.fn(original.createStore),
  };
});

jest.mock('../../redux', () => {
  const original = jest.requireActual('../../redux');
  return {
    ...original,
    __esModule: true,
    waitOnStoreReadiness: jest.fn(original.waitOnStoreReadiness),
  };
});

jest.mock('lodash/isFunction', () => {
  const original = jest.requireActual('lodash/isFunction');
  return jest.fn(original);
});

describe('function createSagaReadyHandler', () => {
  const store = { dispatch: jest.fn() };
  it('creates wrapped onReady function correctly if custom onReady function is passed', () => {
    const customOnReady = jest.fn();
    const sagaOnReady = createSagaReadyHandler(customOnReady);
    expect(sagaOnReady).toBeInstanceOf(Function);
    expect(store.dispatch).not.toHaveBeenCalled();
    expect(customOnReady).not.toHaveBeenCalled();
    sagaOnReady(store);
    expect(store.dispatch).toHaveBeenCalledWith(END);
    expect(customOnReady).toHaveBeenCalledWith(store);
  });
  it('creates wrapped onReady function '
    + 'which does not call custom onReady function '
    + 'if custom onReady function is not a function', () => {
    const customOnReady = 'not a function';
    const sagaOnReady = createSagaReadyHandler(customOnReady);
    expect(sagaOnReady).toBeInstanceOf(Function);
    sagaOnReady(store);
    expect(isFunction).toHaveBeenCalledWith(customOnReady);
    expect(isFunction).toHaveReturnedWith(false);
  });
});

describe('function createStore', () => {
  const reducer = jest.fn(state => ({ ...state }));
  const initialSagaChecker = jest.fn();

  /**
   * Тестовая сага.
   */
  const initialSaga = function* () {
    yield call(initialSagaChecker);
  };

  /**
   * Проверка на корректность стора.
   * @param {Object} store Стор.
   */
  const checkStore = store => {
    expect(store).toBeInstanceOf(Object);
    expect(store.dispatch).toBeInstanceOf(Function);
    expect(store.subscribe).toBeInstanceOf(Function);
    expect(store.getState).toBeInstanceOf(Function);
    expect(createReduxStore).toHaveBeenCalled();
    expect(reducer).toHaveBeenCalled();
    store.dispatch({ type: 'TEST' });
    expect(reducer).toHaveBeenCalledWith({}, { type: 'TEST' });
  };

  /**
   * Проверка на работоспособность функции для запуска саг.
   * @param {Function} runSaga Функция для запуска саг.
   */
  const checkSagaRunner = runSaga => {
    expect(runSaga).toBeInstanceOf(Function);
    expect(initialSagaChecker).not.toHaveBeenCalled();
    expect(runSaga()).toBeInstanceOf(Promise);
    expect(initialSagaChecker).toHaveBeenCalled();
  };
  it('creates store correctly without options.finishObserver', () => {
    expect(createReduxStore).not.toHaveBeenCalled();
    expect(reducer).not.toHaveBeenCalled();
    const { store, runSaga } = createStore(reducer, initialSaga);

    // Проверяем интерфейс и работоспособность созданного store
    checkStore(store);

    // Проверяем работоспособность созданной функции для запуска саг в приложении
    checkSagaRunner(runSaga);
  });
  it('runs waitOnStoreReadiness if options.isReady was passed', () => {
    const isReady = jest.fn();
    expect(createReduxStore).not.toHaveBeenCalled();
    expect(reducer).not.toHaveBeenCalled();
    expect(waitOnStoreReadiness).not.toHaveBeenCalled();
    const { store, runSaga } = createStore(reducer, initialSaga, {
      isReady,
    });

    // Проверяем, что обсервер запустился с правильными аргументами
    expect(waitOnStoreReadiness.mock.calls[0][0]).toEqual(store);
    expect(waitOnStoreReadiness.mock.calls[0][1]).toEqual(isReady);
    expect(waitOnStoreReadiness.mock.calls[0][2]).toBeInstanceOf(Function);

    // Проверяем интерфейс и работоспособность созданного store
    checkStore(store);

    // Проверяем работоспособность созданной функции для запуска саг в приложении
    checkSagaRunner(runSaga);
  });
  it('does not run waitOnStoreReadiness if options.isReady was not passed or it is not function', () => {
    expect(createReduxStore).not.toHaveBeenCalled();
    expect(reducer).not.toHaveBeenCalled();
    expect(waitOnStoreReadiness).not.toHaveBeenCalled();
    createStore(reducer, initialSaga);
    expect(waitOnStoreReadiness).not.toHaveBeenCalled();
    createStore(reducer, initialSaga, {
      isReady: 'I am not a function!',
    });
    expect(waitOnStoreReadiness).not.toHaveBeenCalled();
  });
  it('throws TypeError if "onReady" is passed, when "isReady" not', () => {
    expect(() => createStore(reducer, initialSaga, {
      onReady: () => {},
    })).toThrow(new TypeError(
      'Third argument property "onReady" is a function, when property "isReady" is not a function. '
      + 'The "onReady" function will never be called.'
    ));
  });
});

describe('function mapServiceOptionsToArgs', () => {
  it('creates function arguments array from service options correctly', () => {
    const options = {
      reducer: jest.fn(),
      initialSaga: jest.fn(),
      finishObserver: jest.fn(),
    };
    expect(mapServiceOptionsToArgs(options)).toEqual([
      options.reducer,
      options.initialSaga,
      {
        finishObserver: options.finishObserver,
      },
    ]);
  });
});
