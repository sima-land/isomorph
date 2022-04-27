/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import type { Container, Provider, Token } from './types';

/**
 * Возвращает новый токен.
 * @param name Имя токена для отладки в случае ошибок.
 * @return Токен.
 */
export function createToken<T = never>(name?: string): Token<T> {
  const key = Symbol(name);

  return {
    _key: key,
    _resolve: (registry: Map<symbol, any>) => registry.get(key) as T,
  };
}

export class NothingBoundError extends Error {
  constructor(key: symbol) {
    super(`Nothing bound to ${String(key)}`);
    this.name = 'NothingBoundError';
  }
}

export class CircularDependencyError extends Error {
  constructor(trace: Token<any>[]) {
    const names = trace.map(token => String(token._key)).join(' >> ');
    super(`Circular dependency found, trace: ${names}`);
    this.name = 'CircularDependencyError';
  }
}

/**
 * Возвращает новый DI-контейнер.
 * @return DI-контейнер.
 */
export function createContainer(): Container {
  const cache = new Map<symbol, any>();
  const registry = new Map<symbol, Provider<any>>();

  function resolve<T>(token: Token<T>, chain: Token<any>[]): T {
    if (chain.includes(token)) {
      throw new CircularDependencyError([...chain, token]);
    } else {
      chain.push(token);
    }

    if (cache.has(token._key)) {
      return cache.get(token._key);
    } else if (registry.has(token._key)) {
      const provider = registry.get(token._key);

      if (typeof provider !== 'function') {
        throw new Error('Provider is not a function');
      }

      const value = provider(otherToken => resolve(otherToken, chain));

      // всегда как singleton
      cache.set(token._key, value);

      return value;
    } else {
      throw new NothingBoundError(token._key);
    }
  }

  const container = {
    set<T>(token: Token<T>, provider: Provider<T>): void {
      registry.set(token._key, provider);
    },

    get<T>(token: Token<T>): T {
      return resolve(token, []);
    },
  };

  return container;
}
