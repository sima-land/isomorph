/**
 * Ошибка поиска сервиса в контейнере.
 */
export default class ServiceNotFoundError extends Error {
  /**
   * Конструктор.
   * @param {...*} args Аргументы.
   */
  constructor (...args) {
    super(...args);
    this.name = this.constructor.name;
    Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
  }
}
