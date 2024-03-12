import { Resolve } from '../../../di';
import { LogMiddlewareHandlerInit } from '../../../utils/axios/middleware/log';
import { KnownToken } from '../../../tokens';
import { AxiosLogging } from '../utils/axios-logging';

/**
 * Провайдер обработчика логирования исходящих http-запросов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Обработчик.
 */
export function provideAxiosLogHandler(resolve: Resolve): LogMiddlewareHandlerInit {
  const logger = resolve(KnownToken.logger);

  return data => new AxiosLogging(logger, data);
}
