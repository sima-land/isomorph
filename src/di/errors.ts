import type { Token } from './types';

/**
 * Ошибка, сообщающая, что в контейнере нет сервиса по заданному ключу.
 */
export class NothingBoundError extends Error {
  /**
   * Конструктор.
   * @param key Ключ целевой зависимости.
   */
  constructor(key: symbol) {
    super(`Nothing bound to ${String(key)}`);
    this.name = 'NothingBoundError';
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
