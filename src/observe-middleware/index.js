import isFunction from 'lodash.isfunction';
import getMsFromHRT from '../helpers/utils/get-ms-from-hrt';

/**
 * Немедленно выполняет функцию-обработчик при старте middleware.
 * @param {Function} callback Функция обработчик.
 * @return {*} Результат выполнения функции-обработчика.
 */
export const defaultStartSubscriber = ({ callback }) => callback();

/**
 * Подписчик на событие завершения процесса.
 * @param {http.ServerResponse} response Ответ сервера.
 * @param {Function} callback Функция-обработчик события.
 * @return {http.ServerResponse} Имеет ли событие другие обработчики.
 */
export const defaultFinishSubscriber = ({ response, callback }) => response.once('finish', callback);

/**
 * Возвращает новую функцию - промежуточный слой для Express-приложения.
 * @param {Object} options Опции.
 * @param {Function} options.onStart Сработает при старте запроса, получит временную отметку старта, запрос и ответ.
 * @param {Function} options.onFinish Сработает при отправке ответа, получит временную отметку старта, запрос и ответ.
 * @return {Function} Функция - промежуточный слой для Express.
 */
export const createObserveMiddleware = (
  {
    onStart,
    onFinish,
    startSubscriber = defaultStartSubscriber,
    finishSubscriber = defaultFinishSubscriber,
  } = {}
) => {
  const hasStartHandler = isFunction(onStart);
  const hasFinishHandler = isFunction(onFinish);
  const hasStartSubscriber = isFunction(startSubscriber);
  const hasFinishSubscriber = isFunction(finishSubscriber);

  return (request, response, next) => {
    let startTime = process.hrtime();
    if (hasStartSubscriber) {
      startSubscriber({
        request,
        response,
        callback: () => {
          startTime = process.hrtime();
          if (hasStartHandler) {
            onStart(getMsFromHRT(startTime), request, response);
          }
        },
      });
    }

    if (hasFinishSubscriber) {
      finishSubscriber({
        request,
        response,
        callback: () => {
          const duration = process.hrtime(startTime);
          if (hasFinishHandler) {
            onFinish(getMsFromHRT(duration), request, response);
          }
        },
      });
    }

    next();
  };
};
