import type { Application } from '../container/application';
import type { Provider, Token } from '../container/types';
import type { Preset, PresetEntry } from './types';

/**
 * Возвращает новый "preset" приложения - набор предустановленных компонентов которые можно переопределять.
 * @param defaults Предустановленные зависимости.
 * @return Preset.
 */
export function createPreset(defaults: PresetEntry[]): Preset {
  const registry = new Map<Token<any>, Provider<any>>(defaults);

  return {
    override: <T>(token: Token<T>, provider: Provider<T>) => {
      registry.set(token, provider);
    },

    apply: (container: Application) => {
      for (const [token, provider] of registry) {
        container.bind(token).toProvider(provider);
      }
    },
  };
}