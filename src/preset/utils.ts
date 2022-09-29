import { ConfigSource } from '../config/types';
import { StrictMap } from './types';

/** Реализация пула хостов. */
export class HttpApiHostPool<Key extends string> implements StrictMap<Key> {
  private map: Record<Key, string>;
  private source: ConfigSource;

  /**
   * Конструктор.
   * @param map Карта значений по их ключам.
   * @param source Источник конфигурации.
   */
  constructor(map: Record<Key, string>, source: ConfigSource) {
    this.map = map;
    this.source = source;
  }

  /** @inheritDoc */
  get(key: Key): string {
    const variableName = this.map[key];

    if (!variableName) {
      throw Error(`Known HTTP API not found by key "${key}"`);
    }

    // "лениво" берём переменную, именно в момент вызова (чтобы не заставлять указывать в сервисах все переменные разом)
    return this.source.require(variableName);
  }
}

/**
 * Проверяет соответствие имени хоста паттерну.
 * @param pattern Паттерн.
 * @return Признак соответствия.
 */
export function eqHostname(pattern: RegExp) {
  return typeof window !== 'undefined' && pattern.test(window.location.hostname);
}
