import { createStore, applyMiddleware } from 'redux';

/**
 * Формирует стор для работы приложения
 * @param {Object} middleware Саги
 * @param {Object} initialState Стартовый стэйт приложения
 * @param {Function} reducer Reducer
 * @param {Function} compose Compose для подключения redux-devtools
 * @return {Array} Массив с объектом стора приложения и раннером для запуска саг
 */
const storeCreator = (
  {
    initialState,
    reducer,
    compose = input => input,
    middleware,
  }
) => createStore(reducer, initialState, compose(applyMiddleware(middleware)));

export default storeCreator;
