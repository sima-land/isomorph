import { AxiosResponse, AxiosRequestConfig, AxiosDefaults } from 'axios';
import { Middleware } from 'middleware-axios';
import { Logger } from '../../logger/types';
import { SeverityLevel } from '@sentry/types';

export interface SharedData {
  logger: Logger;
  config: AxiosRequestConfig;
  defaults: AxiosDefaults;
}

export interface DoneSharedData extends SharedData {
  response: AxiosResponse<unknown, unknown>;
}

export interface FailSharedData extends SharedData {
  error: unknown;
}

export interface LoggingMiddlewareHandler {
  beforeRequest: (data: SharedData) => Promise<void> | void;
  afterResponse: (data: DoneSharedData) => Promise<void> | void;
  onCatch: (data: FailSharedData) => Promise<void> | void;
}

/**
 * Возвращает новый middleware для логирования запросов.
 * @param logger Логгер.
 * @param handlerArg Обработчик.
 * @return Middleware.
 */
export function loggingMiddleware(
  logger: Logger,
  handlerArg: LoggingMiddlewareHandler | ((data: SharedData) => LoggingMiddlewareHandler),
): Middleware<any> {
  return async function log(config, next, defaults) {
    const shared: SharedData = { logger, config, defaults };
    const handler = typeof handlerArg === 'function' ? handlerArg(shared) : handlerArg;

    try {
      await handler.beforeRequest(shared);

      const response = await next(config);

      await handler.afterResponse({ ...shared, response });
    } catch (error) {
      await handler.onCatch({ ...shared, error });

      // ВАЖНО: не скрываем ошибку, сообщаем остальному миру про нее
      throw error;
    }
  };
}

/**
 * Возвращает уровень на основе статуса ответа.
 * @todo Возможно стоит вынести в preset.
 * @param status Статус.
 * @return Уровень.
 */
export function severityFromStatus(status: number | undefined): SeverityLevel {
  let result: SeverityLevel;

  if (typeof status === 'number') {
    switch (true) {
      case status >= 200 && status <= 299:
        result = 'info';
        break;
      case status >= 300 && status <= 499:
        result = 'warning';
        break;
      default:
        result = 'error';
    }
  } else {
    result = 'error';
  }

  return result;
}
