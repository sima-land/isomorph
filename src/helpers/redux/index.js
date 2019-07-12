import isFunction from 'lodash.isfunction';

/**
 * Оборачивает опциональный обработчик события готовности стора, добавляя отписку и опциональную очистку таймера.
 * @param {Object} store Стор.
 * @param {Function} unsubscribe Функция отписки от стора.
 * @param {Function|*} onReady Опциональный обработчик события готовности стора.
 * @return {Function} Обёрнутый обработчик готовности стора.
 */
export const prepareOnReady = (store, unsubscribe, onReady) => timer => {
  unsubscribe();
  Number.isInteger(timer) && clearTimeout(timer);
  isFunction(onReady) && onReady(store);
};

/**
 * Наблюдатель за готовностью стора.
 * @param {Object} store Стор.
 * @param {Function} isReady Функция определения готовности стора.
 * @param {Function} onReady Функция обработчик события готовности стора.
 * @param {number} timeout Максимальное время, отведённое на ожидание готовности стора.
 * @return {Object} Стор.
 */
export const waitOnStoreReadiness = (
  store,
  isReady,
  onReady,
  timeout = 2 ** 30,
) => {
  let timer = null;
  onReady = prepareOnReady(
    store,
    store.subscribe(
      () => {
        isReady(store) && onReady(timer);
      }
    ),
    onReady
  );
  timer = setTimeout(
    onReady,
    timeout
  );
  return store;
};
