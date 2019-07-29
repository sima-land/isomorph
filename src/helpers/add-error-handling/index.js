import isFunction from 'lodash.isfunction';

/**
 * Возвращает функцию с обработкой ошибки обработчика роута Express.
 * @param {Function} handler Обработчик роута Express.
 * @param {Function} [errorHandler] Обработчик ошибки роута Express.
 * @return {Function} Обработчик роута обернутого для отлова ошибок.
 */
export const addErrorHandling = (handler, errorHandler) => {
  if (!isFunction(handler)) {
    throw new Error('Аргумент "handler" должен быть функцией.');
  }
  return async (request, response, next, ...args) => {
    try {
      await handler(request, response, next, ...args);
    } catch (err) {
      if (isFunction(errorHandler)) {
        await errorHandler(err, request, response, next, ...args);
      } else {
        await next(err);
      }
    }
  };
};
