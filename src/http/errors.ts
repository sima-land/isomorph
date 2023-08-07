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
  statusCode: number;

  /**
   * @param message Сообщение.
   * @param statusCode Код ответа.
   */
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'ResponseError';
    this.statusCode = statusCode;
  }
}
