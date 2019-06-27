import isFunction from 'lodash/isFunction';
import { getMsFromHRT } from '../utils.js';

/**
 * Возвращает новую функцию - промежуточный слой для Express-приложения.
 * @param {Object} options Опции.
 * @param {Function} options.onStart Сработает при старте запроса, получит временную отметку старта, запрос и ответ.
 * @param {Function} options.onFinish Сработает при отправке ответа, получит временную отметку старта, запрос и ответ.
 * @return {Function} Функция - промежуточный слой для Express.
 */
export const createObserveMiddleware = ({
  onStart,
  onFinish,
} = {}) => {
  const hasStartHandler = isFunction(onStart);
  const hasFinishHandler = isFunction(onFinish);

  return (request, response, next) => {
    const startTime = process.hrtime();

    if (hasStartHandler) {
      onStart(getMsFromHRT(startTime), request, response);
    }

    if (hasFinishHandler) {
      response.once('finish', () => {
        const duration = process.hrtime(startTime);
        onFinish(getMsFromHRT(duration), request, response);
      });
    }

    next();
  };
};
