import { Resolve } from '../../../di';
import { Logger, createLogger } from '../../../log';
import { provideLogHandlerPino } from './log-handler-pino';
import { provideLogHandlerSentry } from './log-handler-sentry';

/**
 * Провайдер Logger'а.
 * @param resolve Функция для получения зависимости по токену.
 * @return Logger.
 */
export function provideLogger(resolve: Resolve): Logger {
  const logger = createLogger();

  // @todo возможно надо придумать как не давать вызывать провайдеры внутри провайдеров
  logger.subscribe(provideLogHandlerPino(resolve));
  logger.subscribe(provideLogHandlerSentry(resolve));

  return logger;
}
