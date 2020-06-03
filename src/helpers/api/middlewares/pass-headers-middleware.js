import { getXClientIp, getCookie } from '../../http/request-getters';
import { getServiceHeaders, getServiceUserAgent } from './helpers';

/**
 * Создаёт middleware для добавления заголовков в запросы API.
 * @param {Object} options Параметры для создания middleware.
 * @param {Object} options.headers Объект заголовков для добавления к запросу в API.
 * @return {function(Object, Function): Promise} Middleware для использования в API.
 */
export const createPassHeadersMiddleware = ({ headers }) =>
  async (requestConfig, next) => {
    if (!requestConfig.headers) {
      requestConfig.headers = {};
    }

    requestConfig.headers = {
      ...requestConfig.headers,
      ...headers,
    };

    await next(requestConfig);
  };

/**
 * Формирует объект заголовков из конфигурации приложения и запроса к приложению.
 * @param {Object} options Опции сервиса.
 * @param {Object} options.config Конфигурация приложения.
 * @param {import('http').IncomingMessage} options.request Запрос приложения.
 * @return {Object} Заголовки.
 */
export const prepareRequestHeaders = ({ config, request }) => ({
  'X-Client-Ip': getXClientIp({ request }),
  'User-Agent': getServiceUserAgent(config),
  Cookie: getCookie(request),
  ...getServiceHeaders(request),
});
