import Redis from 'ioredis';
import { promisify } from 'util';

/**
 * Возвращает функцию устанавливающую статус кэша
 * @param {Object} cache Объект кэша
 * @return {Function} Функция устанавливающая статус кэша
 */
export const getOnConnectCallback = cache => () => cache.status = true;

/**
 * Возвращает функцию устанавливающую статус кэша
 * @param {Object} cache Объект кэша
 * @return {Function} Функция устанавливающая статус кэша
 */
export const getOnReconnectingCallback = cache => () => cache.status = false;

/**
 * Переподключение после ошибки
 * @param {string} code Код ошибки
 * @return {boolean} Сходится ли код ошибки с ECONNREFUSED
 */
export const reconnectOnError = ({ code }) => {
  const targetError = 'ECONNREFUSED';
  return code === targetError;
};

/**
 * Возвращает функцию вощвращающую время для повтора перезаписи в redis
 * @param {number} recDelay Время до перезаписи в redis
 * @return {Function} Функция возвращающая время повторая перезаписи в redis
 */
export const getRetryStrategy = recDelay => () => recDelay;

/**
 * Кэширует данные в Redis
 * @param {Object} config Объект с параметрами Redis
 * @param {Function} reconnectOnError Переподключение после ошибки
 * @param {Function} getRetryStrategy Возвращает функцию вощвращающую время для повтора перезаписи в redis
 * @param {Function} getOnConnectCallback Возвращает функцию устанавливающую статус кэша
 * @param {Function} getOnReconnectingCallback Возвращает функцию устанавливающую статус кэша
 * @return {Object} Объект с методами для работы с Redis
 */
export default function redisCache ({ config = {},
  reconnectOnError, getRetryStrategy, getOnConnectCallback, getOnReconnectingCallback }) {
  const { redisHost, redisPort, redisPassword, redisDB, redisEnabled, defaultCacheDuration, recDelay } = config ;
  let cache = {};
  if (redisEnabled) {
    const client = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      db: redisDB,
      reconnectOnError,
      retryStrategy: getRetryStrategy(recDelay),
      enableOfflineQueue: false,
    });

    client.on('connect', getOnConnectCallback(cache));
    client.on('reconnecting', getOnReconnectingCallback(cache));
    const getAsync = promisify(client.get).bind(client);
    cache = {
      set: (key, value, duration = defaultCacheDuration) => client.set(key, value, 'EX', duration),
      get: key => getAsync(key),
      status: null,
    };
  }
  return cache;
}
