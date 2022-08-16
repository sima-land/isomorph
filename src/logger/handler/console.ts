import type { BaseConfig } from '../../config/types';
import type { LoggerEventHandler } from '../types';
import pino from 'pino';
import pinoPretty from 'pino-pretty';

/**
 * Возвращает новый handler для logger'а для вывода событий в терминал.
 * @param config Конфиг.
 * @return Handler.
 */
export function createConsoleHandler(config: BaseConfig): LoggerEventHandler {
  const isProd = config.env === 'production';

  const logger = pino(
    isProd
      ? {
          formatters: {
            // ВАЖНО: для Fluent необходимо наличие поля level: string
            level: label => ({ level: label }),
          },
        }
      : pinoPretty({
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss.l o',
        }),
  );

  return function handler(event) {
    switch (event.type) {
      case 'log':
      case 'info':
        logger.info(event.data);
        break;
      case 'warn':
        logger.warn(event.data);
        break;
      case 'debug':
        logger.debug(event.data);
        break;
      case 'error':
        logger.error(event.data);
        break;
    }
  };
}
