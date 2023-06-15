/**
 * Ошибка валидации статуса ответа.
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
