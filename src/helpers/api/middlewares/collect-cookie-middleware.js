import uniq from 'lodash/uniq';
import get from 'lodash/get';

/**
 * Создаёт middleware для сбора cookie со всех запросов в API и их передачи в ответ сервера.
 * @param {Object} options Параметры для создания middleware.
 * @param {Object} options.response Ответ на запрос в сервис.
 * @return {function(Object, Function): Promise} Middleware для сбора cookie со всех запросов в API.
 */
const createCollectCookieMiddleware = ({ response }) =>

  /**
   * Middleware для сбора cookie со всех запросов в API.
   * @param {Object} requestConfig Конфигурация запроса API.
   * @param {Function} next Функция для передачи контекста выполнения следующему middleware.
   * @return {Promise} Промис.
   */
  async (requestConfig, next) => {
    const apiResponse = await next(requestConfig);
    const initialCookie = response.get('set-cookie') || [];
    const additionalCookie = get(apiResponse, 'headers.set-cookie', []);
    if (additionalCookie.length) {
      response.set('set-cookie', uniq([...initialCookie, ...additionalCookie]));
    }
  };

export default createCollectCookieMiddleware;
