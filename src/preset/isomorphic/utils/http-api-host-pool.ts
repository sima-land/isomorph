import type { ConfigSource } from '../../../config';
import type { StrictMap } from '../types';

/** Реализация пула хостов. */
export class HttpApiHostPool<Key extends string> implements StrictMap<Key> {
  private map: Record<Key, string>;
  private source: ConfigSource;

  /**
   * Конструктор.
   * @param map Карта "Название api >> Название переменной среды с хостом api".
   * @param source Источник конфигурации.
   */
  constructor(map: Record<Key, string>, source: ConfigSource) {
    this.map = map;
    this.source = source;
  }

  /** @inheritDoc */
  get(key: Key, { absolute }: { absolute?: boolean } = {}): string {
    const variableName = this.map[key];

    if (!variableName) {
      throw Error(`Known HTTP API not found by key "${key}"`);
    }

    // "лениво" берём переменную, именно в момент вызова (чтобы не заставлять указывать в сервисах все переменные разом)
    const value = this.source.require(variableName);

    if (absolute) {
      return new Request(value).url;
    }

    return value;
  }

  /**
   * Возвращает объект в котором ключи - переданные имена хостов а значения - хосты.
   * @param keys Названия хостов.
   * @return Объект.
   */
  getAll(keys: Key[] = Object.keys(this.map) as Key[]): Record<Key, string> {
    return Object.fromEntries(keys.map(key => [key, this.get(key)])) as Record<Key, string>;
  }
}
