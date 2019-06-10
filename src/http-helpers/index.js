/**
 * Получает IP пользователя из заголовков запроса
 * @param {Object} request Запрос
 * @return {string} IP пользователя
 */
export const getXClientIp = ({ request }) => request.headers['x-client-ip']
  || request.headers['x-forwarded-for']
  || request.connection.remoteAddress;

/**
 * Получает метод запроса из объекта запроса
 * @param {Object} request Запрос
 * @return {string} Метод запроса
 */
export const getMethod = ({ request }) => request.method;

/**
 * Получает статус ответа из объекта ответа
 * @param {Object} response Ответ
 * @return {number} Статус ответа
 */
export const getStatus = ({ response }) => response.statusCode;

const httpHelpers = {
  getXClientIp,
  getMethod,
  getStatus,
};

export default httpHelpers;
