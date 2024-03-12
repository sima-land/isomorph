/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { LogHandler, LogHandlerFactory } from '../../../http';
import { FetchLogging } from '../../isomorphic/utils/fetch-logging';

/**
 * Провайдер обработчика логирования axios.
 * @param resolve Функция для получения зависимости по токену.
 * @return Обработчик логирования.
 */
export function provideFetchLogHandler(resolve: Resolve): LogHandler | LogHandlerFactory {
  const logger = resolve(KnownToken.logger);
  const abortController = resolve(KnownToken.Http.Fetch.abortController);

  const logHandler = new FetchLogging(logger);

  // ВАЖНО: отключаем логирование если запрос прерван
  logHandler.disabled = () => abortController.signal.aborted;

  return logHandler;
}
