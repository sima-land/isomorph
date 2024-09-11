/* eslint-disable jsdoc/require-jsdoc */
import type { Container, Provider, Token } from './types';
import { AlreadyBoundError, CircularDependencyError, NothingBoundError } from './errors';

class ContainerImplementation implements Container {
  cache: Map<symbol, any>;
  registry: Map<symbol, Provider<any>>;

  constructor() {
    this.cache = new Map<symbol, any>();
    this.registry = new Map<symbol, Provider<any>>();
  }

  set<T>(token: Token<T>, provider: Provider<T>): void {
    if (this.registry.has(token._key)) {
      throw new AlreadyBoundError(token);
    }

    this.registry.set(token._key, provider);
  }

  get<T>(token: Token<T>): T {
    return this.resolve(token, []);
  }

  private resolve<T>(token: Token<T>, chain: Token<any>[]): T {
    if (chain.includes(token)) {
      throw new CircularDependencyError([...chain, token]);
    } else {
      chain.push(token);
    }

    if (this.cache.has(token._key)) {
      return this.cache.get(token._key);
    } else if (this.registry.has(token._key)) {
      const provider = this.registry.get(token._key);

      if (typeof provider !== 'function') {
        throw new Error('Provider is not a function');
      }

      const value = provider(otherToken => this.resolve(otherToken, chain));

      // всегда как singleton
      this.cache.set(token._key, value);

      return value;
    } else {
      throw new NothingBoundError(token);
    }
  }
}

/**
 * Возвращает новый DI-контейнер.
 * @return DI-контейнер.
 */
export function createContainer(): Container {
  return new ContainerImplementation();
}
