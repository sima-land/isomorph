import { Resolve } from '../../../di';
import { Logger, createLogger } from '../../../log';
import { providePinoHandler } from './log-handler-pino';
import { provideSentryHandler } from './log-handler-sentry';

/**
 * Провайдер Logger'а.
 * @param resolve Функция для получения зависимости по токену.
 * @return Logger.
 */
export function provideLogger(resolve: Resolve): Logger {
  const logger = createLogger();

  // @todo возможно надо придумать как не давать вызывать провайдеры внутри провайдеров
  logger.subscribe(providePinoHandler(resolve));
  logger.subscribe(provideSentryHandler(resolve));

  return logger;
}
