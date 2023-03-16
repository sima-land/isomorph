import type { Token } from './types';

/**
 * Ошибка, сообщающая, что в контейнере нет сервиса по заданному ключу.
 */
export class NothingBoundError extends Error {
  public readonly token: Token<unknown>;

  /**
   * Конструктор.
   * @param token Токен.
   * @param containerName Имя контейнера.
   */
  constructor(token: Token<unknown>, containerName?: string) {
    super(`Nothing bound to ${String(token)} in ${display(containerName)}`);
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
   * @param containerName Имя контейнера.
   */
  constructor(token: Token<unknown>, containerName?: string) {
    super(`Cannot rebind token in ${display(containerName)}, already bound: ${String(token)}`);
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
   * @param containerName Имя контейнера.
   */
  constructor(trace: Token<unknown>[], containerName?: string) {
    const names = trace.map(String).join(' >> ');
    super(`Circular dependency found in ${display(containerName)}, trace: ${names}`);
    this.name = 'CircularDependencyError';
  }
}

/**
 * Вернёт переданное имя контейнера или заглушку.
 * @param containerName Имя.
 * @return Имя или заглушка.
 */
function display(containerName?: string) {
  return containerName ?? '[unknown container]';
}
