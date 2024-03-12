import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { LogMiddlewareHandlerInit } from '../../../utils/axios';
import { AxiosLogging } from '../../isomorphic/utils/axios-logging';

/**
 * Провайдер обработчика логирования axios.
 * @param resolve Функция для получения зависимости по токену.
 * @return Обработчик логирования.
 */
export function provideAxiosLogHandler(resolve: Resolve): LogMiddlewareHandlerInit {
  const logger = resolve(KnownToken.logger);
  const abortController = resolve(KnownToken.Http.Fetch.abortController);

  return data => {
    const logHandler = new AxiosLogging(logger, data);

    // ВАЖНО: отключаем логирование если запрос прерван
    logHandler.disabled = () => abortController.signal.aborted;

    return logHandler;
  };
}
