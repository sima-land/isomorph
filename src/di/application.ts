/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import type {
  Application,
  Container,
  Provider,
  Resolve,
  Token,
  Binding,
  ExtractType,
  Preset,
} from './types';
import { NothingBoundError } from './errors';
import { createToken } from './token';
import { createContainer } from './container';

/**
 * Токен, с помощью которого можно достать из приложения само приложение.
 */
export const CURRENT_APP = createToken('application/self');

class ApplicationImplementation implements Application {
  private container?: Container;
  private parent?: Application;
  private presets: Preset[];
  private providers: Map<Token<any>, Provider<any>>;

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

    container.set(CURRENT_APP, () => this);

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

export function createApplication(): Application {
  return new ApplicationImplementation();
}
