import type { Container, Resolve, Provider, Token } from './types';
import { Container as OwjaContainer } from '@owja/ioc';

export function createToken<T = never>(name?: string): Token<T> {
  const key = Symbol(name);

  return {
    _key: key,
    _resolve(container: OwjaContainer) {
      return container.get(key);
    },
  };
}

export function createContainer(): Container {
  const container = new OwjaContainer();

  const resolve: Resolve = token => token._resolve(container);

  return {
    set<T>(token: Token<T>, provider: Provider<T>) {
      container
        .bind<T>(token._key)
        .toFactory(() => provider(resolve))
        .inSingletonScope();
    },

    get: resolve,
  };
}

export function attachContainer(parent: Container): Container {
  const child = createContainer();

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
    set(token, provider) {
      child.set(token, () => provider(resolve));
    },

    get: resolve,
  };
}
