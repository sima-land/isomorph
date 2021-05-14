import get from 'lodash/get';
import pipe from 'lodash/fp/pipe';
import isFunction from 'lodash/isFunction';
import expressProxy from 'express-http-proxy';

const urlApi = require('url');

/**
 * Получает обработчик с прокинутым path из config url.
 * @param {string} path Часть пути после хоста.
 * @return {Function} Обработчик для передачи URL запроса из оригинальной версии с клиента в проксирующий запрос.
 */
export const getRequestPathResolver = path => request => request && path + request.originalUrl;

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
      proxyReqPathResolver: getRequestPathResolver(getUrlPath(getUrl(config))), ...proxyOptions,
    }) : null;

    if (proxyInstance) {
      proxyInstance(req, res, next);
    } else {
      next();
    }
  };
}

/**
 * Получает path из url без слэша в конце.
 * @param {string} url Url.
 * @return {string} Path или пустую строку.
 */
export const getUrlPath = pipe(
  urlApi.parse,
  url => url.path && url.path.replace(/\/$/, '')
);
