import { getMsFromHRT } from '../../utils/get-ms-from-hrt';

/**
 * Создаёт middleware, собирающий данные о времени ответа запросов в API.
 * @param {Object} response Ответ.
 * @param {string} timeDataKey Ключ свойства в response.locals для сохранения замеров времени.
 * @return {function(Object, Function)} Middleware для сохранения времени ответа API.
 */
const createCountApiResponseTimeMiddleware = ({ response, timeDataKey }) =>

  /**
   * Middleware для сбора данных о времени ответа запросов в API.
   * @param {Object} requestConfig Конфигурация запроса API.
   * @param {Function} next Функция для передачи контекста выполнения следующему middleware.
   * @return {Promise} Промис.
   */
  async (requestConfig, next) => {
    const startTime = process.hrtime();
    const apiResponse = await next(requestConfig);
    const url = apiResponse.config.url.replace(/\/\d+/gi, '/ID');
    const method = apiResponse.config.method.toUpperCase();

    if (!response.locals[timeDataKey]) {
      response.locals[timeDataKey] = {};
    }
    response.locals[timeDataKey][`${method} ${url}`] = getMsFromHRT(process.hrtime(startTime));
    return response;
  };

export default createCountApiResponseTimeMiddleware;
