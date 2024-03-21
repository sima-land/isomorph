import type { LogLevel } from '../log';
import type { ResponseErrorInit } from './types';

/**
 * Ошибка валидации статуса ответа.
 * @todo Переименовать в HttpStatusValidationError?
 */
export class StatusError extends Error {
  readonly response: Response;

  /**
   * @param response Ответ.
   */
  constructor(response: Response) {
    super(`HTTP Request failed with status ${response.status}`);
    this.name = 'StatusError';
    this.response = response;
  }

  /**
   * Определяет, является ли переданное значение ошибкой валидации статуса.
   * @param value Значение.
   * @return Результат.
   */
  static is(value: unknown): value is StatusError {
    return (value as any)?.name === 'StatusError';
  }
}

/**
 * Ошибка в процессе формирования ответа.
 */
export class ResponseError extends Error {
  logLevel: LogLevel | null;
  statusCode: number;
  redirectLocation: string | null;

  /**
   * @param message Сообщение.
   * @param statusCodeOrInit Код ответа.
   */
  constructor(message: string, statusCodeOrInit: number | ResponseErrorInit = 500) {
    super(message);
    this.name = 'ResponseError';

    if (typeof statusCodeOrInit === 'number') {
      this.logLevel = 'error';
      this.statusCode = statusCodeOrInit;
      this.redirectLocation = null;
    } else {
      this.logLevel = statusCodeOrInit.logLevel ?? 'error';
      this.statusCode = statusCodeOrInit.statusCode ?? 500;
      this.redirectLocation = statusCodeOrInit.redirectLocation ?? null;
    }
  }
}
