/**
 * Ошибка в процессе серверного рендеринга.
 */
export class SSRError extends Error {
  statusCode: number;

  /**
   * @param message Сообщение.
   * @param statusCode Код ответа.
   */
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}
