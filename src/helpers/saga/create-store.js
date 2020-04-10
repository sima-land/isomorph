import { applyMiddleware, createStore as createReduxStore } from 'redux';
import createSagaMiddleware, { END } from 'redux-saga';
import isFunction from 'lodash/isFunction';
import { createService } from '../../container';
import waitOnStoreReadiness from '../redux/wait-on-store-readiness';

/**
 * Создаёт функцию для обработки успешного завершения подготовки стора.
 * @param {Function} onReady Опциональный обработчик успешного завершения.
 * @return {Function} Функция для обработки успешного завершения подготовки стора.
 */
export const createSagaReadyHandler = onReady => store => {
  store.dispatch(END);
  isFunction(onReady) && onReady(store);
};

/**
 * Создаёт store с применённым middleware саг.
 * @param {Function} reducer Редьюсер.
 * @param {Function} initialSaga Инициализирующая сага.
 * @param {Object} options Необязательные опции.
 * @param {Function} options.isReady Функция для определения готовности store.
 * @param {Object} options.initialState Начальное состояние.
 * @param {Function} options.compose Функция для применения middleware.
 * @param {Array} options.middleware Список дополнительных middleware.
 * @param {Function} options.onReady Функция которая будет выполнена по готовности store.
 * @param {number} options.timeout Максимальное время ожидания готовности store.
 * @return {Object} Объект со store и функцией runSaga для запуска саг.
 */
export const createStore = (
  reducer,
  initialSaga,
  {
    isReady,
    initialState = {},
    compose = input => input,
    middleware = [],
    onReady,
    timeout,
  } = {},
) => {
  const sagaMiddleware = createSagaMiddleware();
  let store = createReduxStore(
    reducer,
    initialState,
    compose(applyMiddleware(sagaMiddleware, ...middleware))
  );
  if (isFunction(isReady)) {
    store = waitOnStoreReadiness(
      store,
      isReady,
      createSagaReadyHandler(onReady),
      timeout
    );
  } else if (isFunction(onReady)) {
    throw new TypeError(
      'Third argument property "onReady" is a function, when property "isReady" is not a function. '
      + 'The "onReady" function will never be called.'
    );
  }
  return {
    store,
    runSaga: () => sagaMiddleware.run(initialSaga).toPromise(),
  };
};

/**
 * Преобразует опции сервиса в аргументы функции.
 * @param {Object} param Параметры.
 * @param {Function} param.reducer Редьюсер.
 * @param {Function} param.initialSaga Инициализирующая сага.
 * @param {Object} param.options Остальные, необязательные опции.
 * @return {Array} Массив агрументов для использования в функции.
 */
export const mapServiceOptionsToArgs = (
  {
    reducer,
    initialSaga,
    ...options
  }
) => [
  reducer,
  initialSaga,
  options,
];

/**
 * @type {Function} Сервис создания store для использования совместно с контейнером
 */
export const createStoreService = createService(
  createStore,
  mapServiceOptionsToArgs,
);
