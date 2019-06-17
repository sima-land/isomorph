import { createStore, applyMiddleware } from 'redux';

/**
 * Формирует стор для работы приложения
 * @param {Object} middlewares Саги
 * @param {Object} initialState Стартовый стэйт приложения
 * @param {Function} reducer Reducer
 * @param {Function} compose Compose для подключения redux-devtools
 * @param {Function} getAppRunner Функция высшего порядка
 * @return {Object} Массив с объектом стора приложения и раннером для запуска саг
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
  if (typeof reducer === 'function' && typeof compose === 'function' && typeof getAppRunner === 'function') {
    store = {
      ...createStore(reducer, initialState, compose(applyMiddleware(...Object.values(middlewares)))),
      runApp: getAppRunner(middlewares),
    };
  }
  return store;
};

export default storeCreator;
