import type { Logger, LoggerEvent, LoggerEventType, LoggerEventHandler } from './types';

/**
 * Возвращает новый logger - объект для журналирования событий подобно console.
 * @return Logger.
 */
export function createLogger(): Logger {
  const handlers: LoggerEventHandler[] = [];

  // eslint-disable-next-line require-jsdoc, jsdoc/require-jsdoc
  function createMethod(type: LoggerEventType) {
    return function (data: any) {
      const event: LoggerEvent = { type, data };
      for (const handler of handlers) {
        handler(event);
      }
    };
  }

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
