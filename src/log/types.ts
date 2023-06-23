import type { SeverityLevel, Context, Extra, Breadcrumb } from '@sentry/types';

/**
 * Тип события.
 */
export type LogLevel = 'error' | 'log' | 'info' | 'warn' | 'debug';

/**
 * Интерфейс события.
 */
export interface LogEvent {
  type: LogLevel;
  data: unknown;
}

/**
 * Интерфейс функции-обработчика события.
 */
export interface LogHandler {
  (event: LogEvent): void;
}

/**
 * Logger.
 * Поддерживает наиболее распространенные события жизненного цикла программы.
 */
export interface Logger {
  error(data: any): void;
  log(data: any): void;
  info(data: any): void;
  warn(data: any): void;
  debug(data: any): void;

  // @todo вынести в интерфейс SubscribableLogger?
  subscribe(handler: LogHandler): void;
}

/**
 * Контекст ошибки.
 */
export interface ContextData {
  key: string;
  data: Context | null;
}

/**
 * Детали ошибки.
 */
export interface ErrorDetails {
  level?: SeverityLevel;

  context?: ContextData | ContextData[];

  extra?: {
    key: string;
    data: Extra | null;
  };
}

/**
 * Детали хлебной крошки.
 */
export type BreadcrumbDetails = Breadcrumb;

/**
 * Структура данных, которую необходимо выводить в терминал по соглашению внутри компании.
 * @todo Убрать в preset'ы.
 */
export interface ConventionalFluentInfo {
  version: string;
  latency: number;
  method: string;
  remote_ip: string;
  route: string;
  status: number;
}
