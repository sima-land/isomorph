/**
 * Создаёт обработчик события подключения к redis для установки статуса готовности кэша к работе.
 * @param {Object} cache Объект кэша.
 * @return {Function} Функция устанавливающая статус кэша.
 */
export const getOnConnectCallback = cache => () => cache.status = true;

/**
 * Создаёт обработчик события переподключения к redis для установки статуса готовности кэша к работе.
 * @param {Object} cache Объект кэша.
 * @return {Function} Функция устанавливающая статус кэша.
 */
export const getOnReconnectingCallback = cache => () => cache.status = false;

/**
 * Переподключение после ошибки.
 * @param {string} code Код ошибки.
 * @return {boolean} Сходится ли код ошибки с ECONNREFUSED.
 */
export const reconnectOnError = ({ code }) => {
  const targetError = 'ECONNREFUSED';
  return code === targetError;
};

/**
 * Возвращает функцию возвращающую время для повтора перезаписи в redis.
 * @param {number} recDelay Время до перезаписи в redis.
 * @return {Function} Функция возвращающая время повторая перезаписи в redis.
 */
export const getRetryStrategy = recDelay => () => recDelay;
