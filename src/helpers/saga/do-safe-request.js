import { call } from 'redux-saga/effects';
import isFunction from 'lodash/isFunction';
import get from 'lodash/get';

/**
 * @typedef {Object} ServerResponse Ответ сервера
 * @property {boolean} ok Были ли запрос совершен успешно.
 * @property {Object|null} error Объект ошибки.
 * @property {Object|string|null} data Данные ответа.
 * @property {number|null} status Статус ответа.
 */

/**
 * Безопасно запрашивает данные c сервера, с обработкой и логированием ошибок, обрабатывает ответ.
 * @param {Function} performRequest Функция, выполняющая запрос.
 * @param {Object} [options] Опции.
 * @param {Array} [options.args] Аргументы функции, выполняющей запрос.
 * @param {Function} [options.captureException] Обработает ошибку.
 * @return {ServerResponse} Ответ сервера.
 */
export default function * doSafeRequest (
  performRequest,
  options
) {
  const {
    args = [],
    captureException,
  } = options || {};

  let response;
  let ok = false;
  let originalError = null;

  try {
    response = yield call(performRequest, ...args);
    ok = true;
  } catch (error) {
    // пытаемся получить данные ответа из ошибки
    response = error.response;
    if (isFunction(captureException)) {
      captureException(error);
    }

    // добавляем в результат объект ошибки
    originalError = error;
  }
  return {
    ok,
    error: originalError,
    data: get(response, 'data', null),
    status: get(response, 'status', null),
  };
}
