import isFunction from 'lodash/isFunction';

/**
 * Создаёт middleware для прокидывания заголовков из запроса приложения в запросы API.
 * @param {Object} options Параметры для создания middleware.
 * @param {import('http').IncomingMessage} options.request Запрос приложения.
 * @param {string} options.ip IP входящего запроса.
 * @param {Object} options.serviceUserAgent Конфигурация приложения.
 * @return {function(Object): Promise} Middleware для использования в API.
 */
const createPassHeadersMiddleware = ({ request, ip, serviceUserAgent }) =>
  async (requestConfig, next) => {
    if (!requestConfig.headers) {
      requestConfig.headers = {};
    }
    const cookie = request && isFunction(request.get) && request.get('cookie');

    requestConfig.headers = {
      ...requestConfig.headers,
      Cookie: cookie || '',
      'X-Client-Ip': ip || '',
      'User-Agent': serviceUserAgent || '',
    };
    await next(requestConfig);
  };

export default createPassHeadersMiddleware;
