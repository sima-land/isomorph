import type { LogHandler } from '../types';
import type pino from 'pino';

/**
 * Возвращает новый handler для logger'а для вывода событий в терминал.
 * @param pinoInstance Конфиг.
 * @return Handler.
 */
export function createPinoHandler(pinoInstance: pino.Logger): LogHandler {
  return function pinoHandler(event) {
    switch (event.type) {
      case 'log':
      case 'info':
        pinoInstance.info(event.data);
        break;
      case 'warn':
        pinoInstance.warn(event.data);
        break;
      case 'debug':
        pinoInstance.debug(event.data);
        break;
      case 'error':
        pinoInstance.error(event.data);
        break;
    }
  };
}
