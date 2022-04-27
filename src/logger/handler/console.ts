import type { BaseConfig } from '../../config/types';
import pino from 'pino';
import pinoPretty from 'pino-pretty';
import { LoggerEventHandler } from '../types';

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
      : pinoPretty({ colorize: true }),
  );

  return function (event) {
    switch (event.type) {
      case 'info':
        logger.info(event.data);
        break;
      case 'error':
        logger.error(event.data);
        break;
    }
  };
}