import { createService } from '../../../container';
import isFunction from 'lodash/isFunction';
import pathOr from 'lodash/fp/pathOr';
import pick from 'lodash/pick';

const getStatusCode = pathOr('UNKNOWN', 'status');
const getConfig = pathOr({}, 'config');

/**
 * Отправляет крошки http запроса.
 * @param {Function} sendBreadcrumb Функция отправки крошек.
 * @param {Object} response Объект в формате ответа Axios, содержащий данные о запросе.
 * @param {boolean} asRequest Обработать как событие запроса.
 * @private
 */
export const _sendHttpBreadcrumb = (sendBreadcrumb, response, asRequest = false) => {
  const statusCode = asRequest ? 'FETCHING' : getStatusCode(response);
  const { url, baseURL, method, params } = getConfig(response);
  const fullURL = baseURL ? baseURL.replace(/\/$/, '') + url : url;
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

  isFunction(sendBreadcrumb) && sendBreadcrumb(breadcrumb);
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

  /**
   * Middleware для отправки исключения в сервис логирования.
   * @param {Object} requestConfig Конфигурация запроса API.
   * @param {Function} next Функция для передачи контекста выполнения следующему middleware.
   * @return {Promise} Промис.
   */
  async (requestConfig, next) => {
    try {
      await next(requestConfig);
    } catch (error) {
      isFunction(captureExtendedException) && captureExtendedException(
        error,
        pick(
          requestConfig,
          ['url', 'baseURL', 'method', 'headers', 'params', 'data']
        ),
        {
          dataName: 'Request details',
          dataAsContext: true,
        }
      );
    }
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