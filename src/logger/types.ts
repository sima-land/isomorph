export type LoggerEventType = 'error' | 'log' | 'info' | 'warn' | 'debug';

export interface LoggerEvent {
  type: LoggerEventType;
  data: unknown;
}

export interface LoggerEventHandler {
  (event: LoggerEvent): void;
}

export interface Logger {
  error(data: any): void;
  log(data: any): void;
  info(data: any): void;
  warn(data: any): void;
  debug(data: any): void;
  subscribe(handler: LoggerEventHandler): void;
}

export interface ConventionalFluentInfo {
  version: string;
  latency: number;
  method: string;
  remote_ip: string;
  route: string;
  status: number;
}
