import get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import expressProxy from 'express-http-proxy';

/**
 * Функция создающая обработчик запроса
 * @param {string} header Отслеживаемый заголовок
 * @param {Array} map Массив обработчика
 * @param {Object} config Конфигурация приложения
 * @return {Function} Функция, обрабатывающая запрос
 */
export default function createProxyHandler (header, map, config) {
  return (req, res, next) => {
    const headerType = get(req, `headers['${header.toLowerCase()}']`, null);
    const getUrl = headerType ? map[headerType] : null;
    const proxyInstance = isFunction(getUrl) ? expressProxy(getUrl(config)) : null;

    if (proxyInstance) {
      proxyInstance(req, res, next);
    } else {
      next();
    }
  };
}
