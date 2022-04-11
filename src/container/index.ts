import { Container as OwjaContainer } from '@owja/ioc';

export interface Token<T> {
  readonly _key: symbol;
  readonly _resolve: (container: OwjaContainer) => T;
}

export interface Resolve {
  <T>(token: Token<T>): T;
}

export interface Container {
  set: <T>(token: Token<T>, factory: (resolve: Resolve) => T) => void;
  get: <T>(token: Token<T>) => T;
}

export function createContainer(): Container {
  const container = new OwjaContainer();
  const resolve: Resolve = <T>(token: Token<T>) => container.get<T>(token._key);

  return {
    set<T>(token: Token<T>, factory: (resolve: Resolve) => T) {
      container
        .bind<T>(token._key)
        .toFactory(() => factory(resolve))
        .inSingletonScope();
    },

    get<T>(token: Token<T>): T {
      return token._resolve(container);
    },
  };
}

export function createToken<T = never>(name?: string): Token<T> {
  const key = Symbol(name);

  return {
    _key: key,
    _resolve(container: OwjaContainer) {
      return container.get(key);
    },
  };
}
