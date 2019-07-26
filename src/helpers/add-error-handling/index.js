import isFunction from 'lodash.isfunction';

/**
 * Возвращает функцию с обработкой ошибки обработчика роута Express.
 * @param {Function} handler Обработчик роута Express.
 * @param {Function} [errorHandler] Обработчик ошибки роута Express.
 * @return {Function} Обработчик роута обернутого для отлова ошибок.
 */
export const addErrorHandling = (handler, errorHandler) => async (request, response, next, ...args) => {
  if (!isFunction(handler)) {
    await next(new Error('Аргумент "handler" должен быть функцией.'));
  } else {
    try {
      await handler(request, response, next, ...args);
    } catch (err) {
      if (isFunction(errorHandler)) {
        await errorHandler(err, request, response, next, ...args);
      } else {
        await next(err);
      }
    }
  }
};
