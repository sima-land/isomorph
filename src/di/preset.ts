import type { Application, Provider, Token, Preset } from './types';

type PresetEntry<T = any> = [Token<T>, Provider<T>];

/**
 * Возвращает новый "preset" приложения - набор предустановленных компонентов которые можно переопределять.
 * @param defaults Предустановленные зависимости.
 * @return Preset.
 */
export function createPreset(defaults: PresetEntry[]): Preset {
  const registry = new Map<Token<any>, Provider<any>>(defaults);

  const preset = {
    override: <T>(token: Token<T>, provider: Provider<T>) => {
      registry.set(token, provider);
      return preset;
    },

    apply: (app: Application) => {
      for (const [token, provider] of registry) {
        app.bind(token).toProvider(provider);
      }
    },
  };

  return preset;
}
