import type { Token } from './types';

/**
 * Ошибка, сообщающая, что в контейнере нет сервиса по заданному ключу.
 */
export class NothingBoundError extends Error {
  public readonly token: Token<any>;

  /**
   * Конструктор.
   * @param token Токен.
   */
  constructor(token: Token<any>) {
    super(`Nothing bound to ${String(token)}`);
    this.name = 'NothingBoundError';
    this.token = token;
  }
}

/**
 * Ошибка, сообщающая, что в контейнере уже зарегистрирован компонент под таким токеном.
 */
export class AlreadyBoundError extends Error {
  /**
   * Конструктор.
   * @param token Токен.
   */
  constructor(token: Token<any>) {
    super(`Cannot rebind token, already bound: ${String(token)}`);
    this.name = 'AlreadyBoundError';
  }
}

/**
 * Ошибка, сообщающая, что обнаружена циклическая зависимость.
 */
export class CircularDependencyError extends Error {
  /**
   * Конструктор.
   * @param trace Список токенов, в котором обнаружен цикл.
   */
  constructor(trace: Token<any>[]) {
    const names = trace.map(token => String(token._key)).join(' >> ');
    super(`Circular dependency found, trace: ${names}`);
    this.name = 'CircularDependencyError';
  }
}
