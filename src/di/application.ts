/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import type { Application, Provider, Token, Binding, ExtractType, Preset } from './types';
import { AlreadyBoundError, CircularDependencyError, NothingBoundError } from './errors';
import { createToken } from './token';

/**
 * Токен, с помощью которого можно достать из приложения само приложение.
 */
export const CURRENT_APP = createToken<Application>('application/self');

/**
 * Реализация Application.
 */
class ApplicationImplementation implements Application {
  /** Родительское приложение. */
  private parent?: ApplicationImplementation;

  /** Зарегистрированные пресеты. */
  private presets: Preset[];

  /** Зарегистрированные провайдеры. */
  private providers: Map<symbol, Provider<unknown>>;

  /** Инициализированные компоненты (синглтоны). */
  private components: Map<symbol, unknown>;

  /** Инициализировано ли приложение.  */
  private initialized: boolean;

  constructor() {
    this.providers = new Map();
    this.components = new Map();
    this.presets = [];
    this.initialized = false;
  }

  toString() {
    return 'Application';
  }

  bind<T>(token: Token<T>): Binding<T> {
    if (this.providers.has(token._key)) {
      throw new AlreadyBoundError(token, this.toString());
    }

    return {
      toValue: value => {
        this.providers.set(token._key, () => value);
      },
      toProvider: provider => {
        this.providers.set(token._key, provider);
      },
    };
  }

  get<T>(token: Token<T>): T {
    if (!this.initialized) {
      this.bind(CURRENT_APP).toValue(this);

      for (const preset of this.presets) {
        preset.apply(this);
      }

      this.initialized = true;
    }

    return this.resolve(token, []);
  }

  protected resolve<T>(token: Token<T>, chain: Token<any>[]): T {
    const nextChain = () => [...chain, token];

    if (chain.includes(token)) {
      throw new CircularDependencyError(nextChain(), this.toString());
    }

    if (this.components.has(token._key)) {
      return this.components.get(token._key) as T;
    }

    if (this.providers.has(token._key)) {
      const provider = this.providers.get(token._key);

      if (typeof provider !== 'function') {
        throw new Error('Provider is not a function');
      }

      const component = provider(otherToken => this.resolve(otherToken, nextChain()));

      // ВАЖНО: всегда как singleton
      this.components.set(token._key, component);

      return component as T;
    }

    if (this.parent) {
      // ВАЖНО: передаём именно chain а не nextChain()
      return this.parent.resolve(token, chain);
    }

    throw new NothingBoundError(token, this.toString());
  }

  attach(parent: ApplicationImplementation): void {
    if (this.parent) {
      throw new Error('Cannot reattach application');
    }

    this.parent = parent;
  }

  preset(preset: Preset): void {
    this.presets.push(preset);
  }

  invoke<Tokens extends readonly Token<any>[]>(
    tokens: [...Tokens],
    fn: (...args: ExtractType<Tokens>) => void,
  ): void {
    fn(...(tokens.map(token => this.get(token)) as any));
  }
}

/**
 * Возвращает новое DI-приложение.
 * @return DI-приложение.
 */
export function createApplication(): Application {
  return new ApplicationImplementation();
}
