/**
 * Оборачивает опциональный обработчик события готовности стора, добавляя отписку и опциональную очистку таймера.
 * @param {Object} store Стор.
 * @param {Function} unsubscribe Функция отписки от стора.
 * @param {Function|*} onReady Опциональный обработчик события готовности стора.
 * @return {Function} Обёрнутый обработчик готовности стора.
 */
const prepareOnReady = (store, unsubscribe, onReady) => timerId => {
  unsubscribe();

  timerId && clearTimeout(timerId);

  onReady && onReady(store);
};

export default prepareOnReady;
