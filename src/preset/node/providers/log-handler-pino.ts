import pino from 'pino';
import PinoPretty from 'pino-pretty';
import { Resolve } from '../../../di';
import { LogHandler } from '../../../log';
import { createPinoHandler } from '../../../log/handler/pino';
import { KnownToken } from '../../../tokens';

/**
 * Провайдер обработчика логирования для Pino.
 * @param resolve Функция для получения зависимости по токену.
 * @return Обработчик.
 */
export function provideLogHandlerPino(resolve: Resolve): LogHandler {
  const config = resolve(KnownToken.Config.base);

  const pinoLogger = pino(
    config.env === 'production'
      ? {
          formatters: {
            // ВАЖНО: для Fluent необходимо наличие поля level: string
            level: label => ({ level: label }),
          },
        }
      : PinoPretty({
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss.l o',
        }),
  );

  return createPinoHandler(pinoLogger);
}
