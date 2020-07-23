/**
 * Возвращает middleware отслеживания вызванных action'ов.
 * @return {{ reset: Function, dispatchedActions: Array<Object> }} Middleware.
 */
const createTraceMiddleware = () => {
  /**
   * Middleware.
   * @return {Function} Функция.
   */
  const middleware = () => next => action => {
    middleware.dispatchedActions.push(action);
    return next(action);
  };

  middleware.reset = () => {
    middleware.dispatchedActions = [];
  };

  middleware.reset();

  return middleware;
};

export default createTraceMiddleware;
