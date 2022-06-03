import type { Application, Provider, Token, Preset } from './types';

type PresetEntry<T = any> = [Token<T>, Provider<T>];

/**
 * Возвращает новый "preset" для DI-приложения - набор предустановленных компонентов которые можно переопределять.
 * @param defaults Предустановленные зависимости.
 * @return Preset.
 */
export function createPreset(defaults: PresetEntry[]): Preset {
  const registry = new Map<Token<any>, Provider<any>>(defaults);

  // @todo возможно стоит вынести функциональность расширения прямо в Application, избавившись от сущности Preset.
  const preset = {
    override: <T>(token: Token<T>, provider: Provider<T>) => {
      registry.set(token, provider);
      return preset;
    },

    apply: (app: Application) => {
      // @todo избавиться от перебора, сделать так чтобы Application сам умел искать в preset'ах (в целях оптимизации)
      for (const [token, provider] of registry) {
        app.bind(token).toProvider(provider);
      }
    },
  };

  return preset;
}
