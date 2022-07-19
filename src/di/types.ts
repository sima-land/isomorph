export interface Token<T> {
  readonly _key: symbol;
  readonly _resolve: (registry: Map<symbol, any>) => T;
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

export interface Binding<T> {
  toValue: (value: T) => void;
  toProvider: (provider: Provider<T>) => void;
}

export type ExtractType<T extends readonly Token<any>[]> = {
  [index in keyof T]: T[index] extends T[number] ? ReturnType<T[index]['_resolve']> : never;
};

export interface Application {
  preset(preset: Preset): void;
  attach(parent: Application): void;
  bind<T>(token: Token<T>): Binding<T>;
  get<T>(token: Token<T>): T;
  invoke<Tokens extends readonly Token<any>[]>(
    tokens: [...Tokens],
    fn: (...args: ExtractType<Tokens>) => void,
  ): void;
}

export interface Preset {
  /** @deprecated */
  override: <T>(token: Token<T>, provider: Provider<T>) => this;

  set: <T>(token: Token<T>, provider: Provider<T>) => this;

  apply: (app: Application) => void;
}
