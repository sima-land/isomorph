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
