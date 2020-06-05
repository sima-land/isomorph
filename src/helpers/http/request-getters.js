import { isIP } from 'net';
import isFunction from 'lodash/isFunction';

/**
 * Получает IP пользователя из заголовков запроса.
 * @param {Object} request Запрос.
 * @return {string} IP пользователя.
 */
export const getXClientIp = ({ request }) => {
  const ip = request.headers['x-client-ip']
    || request.headers['x-forwarded-for']
    || request.connection.remoteAddress;
  return isIP(ip) ? ip : '';
};

/**
 * Получает метод запроса из объекта запроса.
 * @param {Object} request Запрос.
 * @return {string} Метод запроса.
 */
export const getMethod = ({ request }) => request.method;

/**
 * Получает статус ответа из объекта ответа.
 * @param {Object} response Ответ.
 * @return {number} Статус ответа.
 */
export const getStatus = ({ response }) => response.statusCode;

/**
 * Получает оригинальный url из объекта запроса.
 * @param {Object} request Запрос.
 * @return {number} Url запроса.
 */
export const getOriginalUrl = ({ request }) => request.originalUrl;

/**
 * Получает куки из запроса.
 * @param {Object} request Запрос.
 * @return {string} Куки.
 */
export const getCookie = request => (request && isFunction(request.get) && request.get('cookie')) || '';
