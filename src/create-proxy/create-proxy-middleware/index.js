import get from 'lodash.get';
import isFunction from 'lodash.isfunction';
import expressProxy from 'express-http-proxy';

/**
 * Обработчик для передачи URL запроса из оригинальной версии с клиента в проксирующий запрос.
 * @param {Object} request Исходный запрос с клиента.
 * @return {string} URL исходного запроса.
 */
export const requestPathResolver = request => request && request.originalUrl;

/**
 * Функция создающая обработчик запроса.
 * @param {string} header Отслеживаемый заголовок.
 * @param {Array} map Массив обработчика.
 * @param {Object} config Конфигурация приложения.
 * @param {Object} proxyOptions Пользовательская конфигурация прокси.
 * @return {Function} Функция, обрабатывающая запрос.
 */
export default function createProxyMiddleware (header, map, config, proxyOptions = {}) {
  return (req, res, next) => {
    const headerType = get(req, `headers['${header.toLowerCase()}']`, null);
    const getUrl = headerType ? map[headerType] : null;
    const proxyInstance = isFunction(getUrl) ? expressProxy(getUrl(config), {
      proxyReqPathResolver: requestPathResolver,
      ...proxyOptions,
    }) : null;

    if (proxyInstance) {
      proxyInstance(req, res, next);
    } else {
      next();
    }
  };
}
