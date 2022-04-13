import type { Logger, LoggerEvent, LoggerEventType, LoggerEventHandler } from './types';

export function createLogger(): Logger {
  const handlers: LoggerEventHandler[] = [];

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
    subscribe(handler) {
      handlers.push(handler);
    },
  };
}
