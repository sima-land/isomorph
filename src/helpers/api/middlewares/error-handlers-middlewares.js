import { createService } from '../../../container';
import pick from 'lodash/pick';

/**
 * Отправляет крошки http запроса.
 * @param {Function} sendBreadcrumb Функция отправки крошек.
 * @param {Object} response Объект в формате ответа Axios, содержащий данные об ответе.
 * @param {boolean} asRequest Обработать как событие запроса.
 * @private
 */
export const _sendHttpBreadcrumb = (sendBreadcrumb, response, asRequest = false) => {
  const statusCode = asRequest ? 'FETCHING' : response?.status || 'UNKNOWN';
  const { url, baseURL, method, params } = response?.config || {};

  const fullURL = baseURL ? `${baseURL.replace(/\/$/, '')}${url}` : url;

  const breadcrumb = {
    category: asRequest ? 'http.request' : 'http.response',
    type: 'http',
    data: {
      url: fullURL,
      status_code: statusCode,
      method: method && method.toUpperCase(),
      params,
    },
    level: asRequest || (statusCode >= 200 && statusCode < 300) ? 'info' : 'error',
  };

  sendBreadcrumb && sendBreadcrumb(breadcrumb);
};

/**
 * Создаёт middleware, добавляющий хлебные крошки о запросе в API в сервис логирования ошибок.
 * @param {Object} sentry Сервис логирования.
 * @param {Function} sentry.captureBreadcrumb Функция сбора хлебных крошек.
 * @return {function(Object, Function)} Middleware для добавления крошек.
 * @private
 */
const _createAttachBreadcrumbsMiddleware = ({ captureBreadcrumb }) =>

  /**
   * Middleware добавления крошек в сервис логирования.
   * @param {Object} requestConfig Конфигурация запроса API.
   * @param {Function} next Функция для передачи контекста выполнения следующему middleware.
   * @return {Promise} Промис.
   */
  async (requestConfig, next) => {
    try {
      _sendHttpBreadcrumb(captureBreadcrumb, { config: requestConfig }, true);
      const apiResponse = await next(requestConfig);
      _sendHttpBreadcrumb(captureBreadcrumb, apiResponse);
    } catch (error) {
      error.isAxiosError && error.response && _sendHttpBreadcrumb(captureBreadcrumb, error.response);

      throw error;
    }
  };

/**
 * Создаёт middleware, отправляющий исключения при запросе в API в сервис логирования ошибок.
 * @param {Object} sentry Сервис логирования.
 * @param {Function} sentry.captureExtendedException Функция отправки исключения.
 * @return {function(Object, Function)} Middleware для захвата исключения.
 * @private
 */
const _createHandleExceptionMiddleware = ({ captureExtendedException }) =>
  async (config, next, defaults) => {
    try {
      await next(config);
    } catch (error) {
      const { status } = error.response || {};
      const { logLevelConfig } = config;

      captureExtendedException && captureExtendedException(
        error,
        pick(
          { ...defaults, ...config },
          ['url', 'baseURL', 'method', 'headers', 'params', 'data']
        ),
        {
          dataName: 'Request details',
          dataAsContext: true,
          level: _getLevelFromConfig(status, logLevelConfig),
        }
      );
    }
  };

/**
 * Функция преобразования конфига уровней логирования запроса в уровень логирования Sentry.
 * @param {number} statusCode Код ответа сервера.
 * @param {Object} logLevelConfig Конфиг уровней логирования. `{ default: 'error', 422: 'warning', 419: 'error' }`.
 * @return {string} Log level.
 * @private
 */
export const _getLevelFromConfig = (statusCode, logLevelConfig = {}) => {
  let level = logLevelConfig.default || 'warning';

  if (statusCode && logLevelConfig[statusCode]) {
    level = logLevelConfig[statusCode];
  }

  return level;
};

/**
 * Функция преобразования зависимостей сервиса в аргументы функции.
 * @param {Object} dependencies Зависимости.
 * @return {Array} Массив аргументов.
 * @private
 */
export const _deptToArg = ({ sentry }) => [sentry];

export const createAttachBreadcrumbsMiddleware = createService(
  _createAttachBreadcrumbsMiddleware,
  _deptToArg
);

export const createHandleExceptionMiddleware = createService(
  _createHandleExceptionMiddleware,
  _deptToArg
);
