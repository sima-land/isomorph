import type { Container, Provider, Token } from '../container/types';
import type { Preset, PresetEntry } from './types';

/**
 * Возвращает новый "preset" для DI-контейнера - набор предустановленных компонентов которые можно переопределять.
 * @param defaults Предустановленные зависимости.
 * @return Preset.
 */
export function createPreset(defaults: PresetEntry[]): Preset {
  const registry = new Map<Token<any>, Provider<any>>();

  for (const [token, provider] of defaults) {
    registry.set(token, provider);
  }

  return {
    override: <T>(token: Token<T>, provider: Provider<T>) => {
      registry.set(token, provider);
    },

    apply: (container: Container) => {
      for (const [token, provider] of registry) {
        container.set(token, provider);
      }
    },
  };
}
