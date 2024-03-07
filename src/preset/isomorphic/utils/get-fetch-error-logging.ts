import { log, type LogHandler, type LogHandlerFactory, type Middleware } from '../../../http';

/**
 * Возвращает новый промежуточный слой логирования ошибки исходящего запроса.
 * @param handlerInit Обработчик.
 * @return Промежуточный слой.
 */
export function getFetchErrorLogging(handlerInit: LogHandler | LogHandlerFactory): Middleware {
  const getHandler: LogHandlerFactory =
    typeof handlerInit === 'function' ? handlerInit : () => handlerInit;

  return log({
    onCatch: data => {
      getHandler(data).onCatch?.(data);
    },
  });
}
