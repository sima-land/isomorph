import Redis from 'ioredis';
import { promisify } from 'util';

export let client;
export let cache = {};
/**
 * Устанавливает статус кэша
 * @return {boolean} Возвращает true при соединении
 */
export const cacheStatusConnect = () => cache.status = true;

/**
 * Устанавливает статус кэша
 * @return {boolean} Возвращает false если происходит reconnect
 */
export const cacheStatusReconnecting = () => cache.status = false;

/**
 * Переподключение после ошибки
 * @param {string} code Код ошибки
 * @return {boolean} Сходится ли код ошибки с ECONNREFUSED
 */
export const reconnectOnErrorFunc = ({ code }) => {
  const targetError = 'ECONNREFUSED';
  return code === targetError;
};

/**
 * Возвращает время для повтора перезаписи в redis
 * @param {number} recDelay Время до перезаписи в redis
 * @return {number} Время до перезаписи в redis
 */
export const retryStrategyDelay = recDelay => recDelay;

/**
 * Кэширует данные в Redis
 * @param {Object} config Объект с параметрами Redis
 * @return {Object} Объект с методами для работы с Redis
 */
export default function redisCache ({ config = {} }) {
  const { redisHost, redisPort, redisPassword, redisDB, redisEnabled, defaultCacheDuration, recDelay } = config ;

  if (redisEnabled) {
    client = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      db: redisDB,
      reconnectOnError: reconnectOnErrorFunc,
      retryStrategy: retryStrategyDelay(recDelay),
      enableOfflineQueue: false,
    });

    client.on('connect', cacheStatusConnect);
    client.on('reconnecting', cacheStatusReconnecting);
    const getAsync = promisify(client.get).bind(client);
    cache = {
      set: (key, value, duration = defaultCacheDuration) => client.set(key, value, 'EX', duration),
      get: key => getAsync(key),
      status: null,
    };
  }
  return cache;
}
