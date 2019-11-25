import Redis from 'ioredis';
import { promisify } from 'util';
import { createService } from '../container/index';

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

/**
 * Кэширует данные в Redis.
 * @param {Object} config Объект с параметрами Redis.
 * @param {Function} reconnectAfterError Переподключение после ошибки.
 * @param {Function} getRepeatStrategy Устанавливает время для повтора перезаписи в redis.
 * @param {Function} getOnJoinCallback Коллбэк функция при коннект статусе.
 * @param {Function} getAfterReconnectingCallback Коллбэк функция при реконнект статусе.
 * @return {Object} Объект с методами для работы с Redis.
 */
export const createRedisCache = (
  config,
  reconnectAfterError = reconnectOnError,
  getRepeatStrategy = getRetryStrategy,
  getOnJoinCallback = getOnConnectCallback,
  getAfterReconnectingCallback = getOnReconnectingCallback
) => {
  const { cacheConfig = {}, recDelay, defaultCacheDuration, redisEnabled } = config;
  let cache = {};
  if (redisEnabled) {
    const client = new Redis({
      reconnectAfterError,
      retryStrategy: getRepeatStrategy(recDelay),
      ...cacheConfig,
    });
    client.on('connect', getOnJoinCallback(cache));
    client.on('reconnecting', getAfterReconnectingCallback(cache));
    const getAsync = promisify(client.get).bind(client);
    cache = {
      set: (key, value, duration = defaultCacheDuration) => client.set(key, value, 'EX', duration),
      get: key => getAsync(key),
      status: null,
    };
  }
  return cache;
};

/**
 * Преобразует опции сервиса в аргументы функции.
 * @param {Object} param Параметры.
 * @param {Object} param.config Объект с параметрами Redis.
 * @param {Function} param.reconnectAfterError Переподключение после ошибки.
 * @param {Function} param.getRepeatStrategy Время для повтора перезаписи в redis.
 * @param {Function} param.getOnJoinCallback Устанавливает статус кэша.
 * @param {Function} param.getAfterReconnectingCallback Устанавливает статус кэша.
 * @return {Object} Config Объект с параметрами Redis.
 */
export const mapServiceOptionsToArgs = ({
  config,
  reconnectAfterError,
  getRepeatStrategy,
  getOnJoinCallback,
  getAfterReconnectingCallback,
}) => [
  config,
  reconnectAfterError,
  getRepeatStrategy,
  getOnJoinCallback,
  getAfterReconnectingCallback,
];
export default createService(createRedisCache, mapServiceOptionsToArgs);
