/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import type { Container, Provider, Resolve, Token } from './types';
import type { Preset } from '../preset/types';
import { createContainer, createToken, NothingBoundError } from '.';

type ExtractType<T extends readonly Token<any>[]> = {
  [index in keyof T]: T[index] extends T[number] ? ReturnType<T[index]['_resolve']> : never;
};

interface Binding<T> {
  toValue: (value: T) => void;
  toProvider: (provider: Provider<T>) => void;
}

export class Application {
  private container?: Container;
  private parent?: Application;
  private presets: Preset[];
  private providers: Map<Token<any>, Provider<any>>;

  static readonly self = createToken('application/self');

  constructor() {
    this.providers = new Map();
    this.presets = [];
  }

  bind<T>(token: Token<T>): Binding<T> {
    return {
      toValue: value => {
        this.providers.set(token, () => value);
      },
      toProvider: provider => {
        this.providers.set(token, provider);
      },
    };
  }

  get<T>(token: Token<T>): T {
    try {
      return this.getContainer().get(token);
    } catch (error) {
      if (error instanceof NothingBoundError && this.parent) {
        return this.parent.get(token);
      } else {
        throw error;
      }
    }
  }

  private getContainer(): Container {
    if (!this.container) {
      this.container = this.configureContainer();
    }

    return this.container;
  }

  private configureContainer(): Container {
    const container = createContainer();

    container.set(Application.self, () => this);

    for (const preset of this.presets) {
      preset.apply(this);
    }

    const resolve: Resolve = token => this.get(token);

    for (const [token, provider] of this.providers) {
      container.set(token, () => provider(resolve));
    }

    return container;
  }

  attach(parent: Application): void {
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
