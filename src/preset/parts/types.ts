export type KnownHttpApiKey = 'ilium' | 'simaV3' | 'simaV4' | 'simaV6';

/**
 * Строгая версия Map без возможности добавлять/удалять.
 */
export interface StrictMap<Key extends string> {
  /** Возвращает значение по ключу. */
  get(key: Key): string;
}
