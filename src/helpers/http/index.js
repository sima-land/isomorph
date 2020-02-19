import { isIP } from 'net';

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
 * Валидация http статуса ответа на POST запрос.
 * @param {number} status Статус http ответа.
 * @return {boolean} Валидность.
 */
export const validatePostStatus = status => status === 201;

/**
 * Валидация http статуса ответа на DELETE запрос.
 * @param {number} status Статус http ответа.
 * @return {boolean} Валидность.
 */
export const validateDeleteStatus = status => status === 204;

/**
 * Валидация http статуса 200.
 * @param {number} status Статус http ответа.
 * @return {boolean} Валидность.
 */
export const isOkStatus = status => status === 200;
