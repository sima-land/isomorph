import { Token } from './types';

/**
 * Возвращает новый токен.
 * @param name Имя токена для отладки в случае ошибок.
 * @return Токен.
 */
export function createToken<T = never>(name?: string): Token<T> {
  const key = Symbol(name);

  return {
    _key: key,
    _resolve: source => source.get(key),
  };
}
