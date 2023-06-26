import type { Provider, Token } from '../../di';

export interface PresetTuner {
  (tools: { override: <T>(token: Token<T>, provider: Provider<T>) => void }): void;
}

export type KnownHttpApiKey = 'ilium' | 'simaV3' | 'simaV4' | 'simaV6';

/**
 * Строгая версия Map без возможности добавлять/удалять.
 */
export interface StrictMap<Key extends string> {
  /** Возвращает значение по ключу. */
  get(key: Key): string;
}
