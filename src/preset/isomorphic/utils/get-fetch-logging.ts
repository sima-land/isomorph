import { log, type LogHandler, type LogHandlerFactory, type Middleware } from '../../../http';

/**
 * Возвращает новый промежуточный слой логирования исходящего запроса и входящего ответа.
 * @param handlerInit Обработчик.
 * @return Промежуточный слой.
 * @todo Возможно стоит переименовать в getFetchRequestLogging.
 */
export function getFetchLogging(handlerInit: LogHandler | LogHandlerFactory): Middleware {
  const getHandler: LogHandlerFactory =
    typeof handlerInit === 'function' ? handlerInit : () => handlerInit;

  return log({
    onRequest: data => {
      getHandler(data).onRequest?.(data);
    },
    onResponse: data => {
      getHandler(data).onResponse?.(data);
    },
  });
}
