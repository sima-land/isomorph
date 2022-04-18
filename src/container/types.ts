import type { Container as OwjaContainer } from '@owja/ioc';

export interface Token<T> {
  readonly _key: symbol;
  readonly _resolve: (container: OwjaContainer) => T;
}

export interface Resolve {
  <T>(token: Token<T>): T;
}

export interface Provider<T> {
  (resolve: Resolve): T;
}

export interface Container {
  set: <T = never>(token: Token<T>, provider: Provider<T>) => void;
  get: Resolve;
}
