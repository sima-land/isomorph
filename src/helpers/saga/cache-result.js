import { call } from 'redux-saga/effects';
import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';
import doSafeRequest from './do-safe-request';

/**
 * Проверяет налчие данных запрошенных из кэша.
 * @param {*} data Данные, запрошенных из кэша.
 * @return {boolean} Получен ли ответ.
 */
export const validateCacheDefault = data => Boolean(data);

/**
 * Проверяет валидность ответа API.
 * @param {Object} response Ответ API.
 * @return {boolean} Результат проверки.
 */
export const validateResultDefault = response =>
  Boolean(response) && isPlainObject(response) && Boolean(response.ok);

/**
 * @typedef {Object} Cache Объект кэша.
 * @property {Function} get Функция, получающая данные из кэша.
 * @property {Function} set Функция, записывающая данные в кэш.
 * @property {boolean} status Статус достпности кэша.
 */

/**
 * Запрашивает данные с сервера с кэшированием.
 * @param {Object} options Настройки кэширования.
 * @param {Cache} options.cache Объект кэша.
 * @param {string} options.key Ключ для сохранения.
 * @param {Function} options.validateCache Функция для проверки валидности данных кэша.
 * @param {Function} options.validateResult Функция для проверки валидности результата при сохранении в кэш.
 * @param {Function} options.fn Функция для получения данных.
 * @param {Array} options.args Аргументы функции для запроса данных.
 * @return {import('./do-safe-request').ServerResponse} Результат.
 */
export default function * cacheResult ({
  cache,
  key,
  validateCache = validateCacheDefault,
  validateResult = validateResultDefault,
  fn = doSafeRequest,
  args = [],
  duration = 3600,
}) {
  const { get, set, status } = cache || {};
  const isCacheAvailable = status && isFunction(get) && isFunction(set);
  const canDoRequest = isFunction(validateCache) && isFunction(fn);
  let result = isCacheAvailable && (yield call(get, key));

  if (validateCache(result)) {
    result = JSON.parse(result);
  }

  if (canDoRequest && !validateCache(result)) {
    result = yield call(fn, ...args);
    const isResultValid = isFunction(validateResult) && validateResult(result);

    if (isCacheAvailable && isResultValid) {
      yield call(set, key, JSON.stringify(result), duration);
    }
  }

  return result;
}
