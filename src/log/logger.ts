import type { Logger, LogEvent, LogLevel, LogHandler } from './types';

/**
 * Возвращает новый logger - объект для журналирования событий подобно console.
 * @return Logger.
 */
export function createLogger(): Logger {
  const handlers: LogHandler[] = [];

  // eslint-disable-next-line jsdoc/require-jsdoc
  const createMethod = (type: LogLevel) => (data: any) => {
    const event: LogEvent = { type, data };

    for (const handler of handlers) {
      handler(event);
    }
  };

  return {
    log: createMethod('log'),
    info: createMethod('info'),
    warn: createMethod('warn'),
    error: createMethod('error'),
    debug: createMethod('debug'),

    subscribe: handler => {
      handlers.push(handler);
    },
  };
}
