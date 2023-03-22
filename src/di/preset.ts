/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import type { Application, Provider, Token, Preset } from './types';

type PresetEntry<T = any> = [Token<T>, Provider<T>];

class PresetImplementation implements Preset {
  private registry: Map<Token<any>, Provider<any>>;

  constructor(defaults: Iterable<PresetEntry>) {
    this.registry = new Map<Token<any>, Provider<any>>(defaults);
  }

  set<T>(token: Token<T>, provider: Provider<T>): this {
    this.registry.set(token, provider);
    return this;
  }

  apply(app: Application): void {
    for (const [token, provider] of this.registry) {
      app.bind(token).toProvider(provider);
    }
  }
}

/**
 * Возвращает новый "preset" для DI-приложения - набор предустановленных компонентов которые можно переопределять.
 * @param defaults Предустановленные зависимости.
 * @return Preset.
 */
export function createPreset(defaults: PresetEntry[]): Preset {
  return new PresetImplementation(defaults);
}
