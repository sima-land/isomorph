import Redis from 'ioredis';
import { promisify } from 'util';
import { createService } from '../container/index';
import {
  reconnectOnError,
  getRetryStrategy,
  getOnConnectCallback,
  getOnReconnectingCallback,
} from './helpers';

/**
 * Кэширует данные в Redis.
 * @param {Object} config Объект с параметрами Redis.
 * @param {Function} [reconnectAfterError] Переподключение после ошибки.
 * @param {Function} [getRepeatStrategy] Устанавливает время для повтора перезаписи в redis.
 * @param {Function} [getOnJoinCallback] Коллбэк функция при коннект статусе.
 * @param {Function} [getAfterReconnectingCallback] Коллбэк функция при реконнект статусе.
 * @return {Object} Объект с методами для работы с Redis.
 */
export const createRedisCache = (
  config,
  reconnectAfterError = reconnectOnError,
  getRepeatStrategy = getRetryStrategy,
  getOnJoinCallback = getOnConnectCallback,
  getAfterReconnectingCallback = getOnReconnectingCallback
) => {
  const {
    cacheConfig = {},
    recDelay,
    defaultCacheDuration,
    redisEnabled,
    sentinelEnabled,
    sentinelConfig,
  } = config || {};
  const cache = { status: null };

  if (redisEnabled || sentinelEnabled) {
    const client = new Redis(
      redisEnabled ? {
        reconnectAfterError,
        retryStrategy: getRepeatStrategy(recDelay),
        ...cacheConfig,
      } : sentinelConfig
    );

    client.on('connect', getOnJoinCallback(cache));
    client.on('reconnecting', getAfterReconnectingCallback(cache));

    const getAsync = promisify(client.get).bind(client);
    cache.set = (key, value, duration = defaultCacheDuration) => client.set(key, value, 'EX', duration);
    cache.get = key => getAsync(key);
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
