import get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import { createService } from '../../container';

/**
 * Генерирует параметры приложения.
 * @param {Object} request Запрос.
 * @param {Object} config Конфиг приложения.
 * @param {Function} getValue Генератор значения.
 * @param {Function} modify Модификатор Значения.
 * @param {Object} defaultValue Значение поумолчанию.
 * @return {Object} Параметры приложения.
 */
export const getParams = (request, config, getValue = () => {}, modify, defaultValue) => {
  let result = getValue(request);
  if (!result) {
    result = defaultValue;
  }
  if (isFunction(modify)) {
    result = modify(result, request, config);
  }
  return result;
};

/**
 * Парсит заголовок запроса.
 * @param {Object} request Запрос.
 * @return {Object} Параметры.
 */
export const parseHttpHeaders = request => {
  /**
   * Node.js переводит в ASCII.
   * @see {https://github.com/nodejs/node/issues/17390}
   */
  const params = Buffer.from(
    get(request, 'headers[simaland-params]', ''),
    'binary'
  ).toString('utf8');
  return params ? JSON.parse(params) : null;
};

export default createService(
  getParams,
  (
    {
      request,
      config,
      getValue,
      modify,
      defaultValue,
    }
  ) => [
    request,
    config,
    getValue,
    modify,
    defaultValue,
  ]
);
