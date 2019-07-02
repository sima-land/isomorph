import { createStore, applyMiddleware } from 'redux';
import isFunction from 'lodash/isFunction';

/**
 * Формирует стор для работы приложения.
 * @param {Object} middlewares Саги.
 * @param {Object} initialState Стартовый стэйт приложения.
 * @param {Function} reducer Reducer.
 * @param {Function} compose Compose для подключения redux-devtools.
 * @param {Function} getAppRunner Функция высшего порядка.
 * @return {Object} Массив с объектом стора приложения и раннером для запуска саг.
 */
const storeCreator = (
  {
    middlewares = {},
    initialState = {},
    reducer,
    compose,
    getAppRunner,
  }
) => {
  let store = {};
  if (isFunction(reducer) && isFunction(compose) && isFunction(getAppRunner)) {
    store = {
      ...createStore(reducer, initialState, compose(applyMiddleware(...Object.values(middlewares)))),
      runApp: getAppRunner(middlewares),
    };
  }
  return store;
};

export default storeCreator;
