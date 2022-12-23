/**
 * Тип события.
 */
export type LoggerEventType = 'error' | 'log' | 'info' | 'warn' | 'debug';

/**
 * Интерфейс события.
 */
export interface LoggerEvent {
  type: LoggerEventType;
  data: unknown;
}

/**
 * Интерфейс функции-обработчика события.
 */
export interface LoggerEventHandler {
  (event: LoggerEvent): void;
}

/**
 * Интерфейс логгера.
 * Поддерживает наиболее распространенные события жизненного цикла программы.
 */
export interface Logger {
  error(data: any): void;
  log(data: any): void;
  info(data: any): void;
  warn(data: any): void;
  debug(data: any): void;
  subscribe(handler: LoggerEventHandler): void;
}

/**
 * Структура данных, которую необходимо выводить в терминал по соглашению внутри компании.
 * @todo Убрать в preset'ы?
 */
export interface ConventionalFluentInfo {
  version: string;
  latency: number;
  method: string;
  remote_ip: string;
  route: string;
  status: number;
}
