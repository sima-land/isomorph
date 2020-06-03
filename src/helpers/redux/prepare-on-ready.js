import isFunction from 'lodash/isFunction';

/**
 * Оборачивает опциональный обработчик события готовности стора, добавляя отписку и опциональную очистку таймера.
 * @param {Object} store Стор.
 * @param {Function} unsubscribe Функция отписки от стора.
 * @param {Function|*} onReady Опциональный обработчик события готовности стора.
 * @return {Function} Обёрнутый обработчик готовности стора.
 */
const prepareOnReady = (store, unsubscribe, onReady) => timer => {
  unsubscribe();
  timer && clearTimeout(timer);
  isFunction(onReady) && onReady(store);
};

export default prepareOnReady;
