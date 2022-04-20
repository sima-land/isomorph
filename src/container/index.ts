import type { Container, Resolve, Provider, Token } from './types';
import { Container as OwjaContainer } from '@owja/ioc';

/**
 * Возвращает новый токен.
 * @param name Имя токена для отладки в случае ошибок.
 * @return Токен.
 */
export function createToken<T = never>(name?: string): Token<T> {
  const key = Symbol(name);

  return {
    _key: key,
    _resolve: (container: OwjaContainer) => container.get(key),
  };
}

/**
 * Возвращает новый DI-контейнер.
 * @return DI-контейнер.
 */
export function createContainer(): Container {
  // @todo избавиться от @owja/ioc так как он немного неправильно выводит ошибки
  const container = new OwjaContainer();

  // eslint-disable-next-line require-jsdoc, jsdoc/require-jsdoc
  const resolve: Resolve = token => token._resolve(container);

  return {
    set: <T>(token: Token<T>, provider: Provider<T>) => {
      container
        .bind<T>(token._key)
        .toFactory(() => provider(resolve))
        .inSingletonScope();
    },

    get: resolve,
  };
}

/**
 * Возвращает новый дочерний контейнер.
 * При отсутствии зарегистрированного сервиса, он будет искаться в родительском контейнере.
 * @param parent Родительский контейнер.
 * @return DI-контейнер.
 */
export function attachContainer(parent: Container): Container {
  const child = createContainer();

  // eslint-disable-next-line require-jsdoc, jsdoc/require-jsdoc
  const resolve: Resolve = token => {
    try {
      return child.get(token);
    } catch (error) {
      if (typeof error === 'string' && error.startsWith('nothing bound to')) {
        return parent.get(token);
      } else {
        throw error;
      }
    }
  };

  return {
    set: (token, provider) => {
      child.set(token, () => provider(resolve));
    },

    get: resolve,
  };
}
