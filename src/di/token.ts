import { Token } from './types';

/**
 * Реализация токена.
 */
class TokenImplementation<T = never> implements Token<T> {
  readonly _key: symbol;

  /**
   * Конструктор.
   * @param name Имя для отладки.
   */
  constructor(name?: string) {
    this._key = Symbol(name);
  }

  /**
   * Получив реестр вернет из него нужный компонент.
   * @param registry Реестр.
   * @return Компонент.
   */
  _resolve(registry: Map<symbol, any>): T {
    return registry.get(this._key);
  }

  /**
   * @inheritdoc
   */
  toString(): string {
    return `Token(${this._key.description ?? 'unknown'})`;
  }
}

/**
 * Возвращает новый токен.
 * @param name Имя токена для отладки в случае ошибок.
 * @return Токен.
 */
export function createToken<T = never>(name?: string): Token<T> {
  return new TokenImplementation(name);
}
