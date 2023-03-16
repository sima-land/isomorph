import type { ConfigSource } from './types';
import { Env } from '@humanwhocodes/env';

declare const __ISOMORPH_ENV__: unknown;

interface Dictionary {
  readonly [key: string]: string | undefined;
}

/**
 * Возвращает новый источник конфигурации.
 * @param options Опции.
 * @return Источник.
 */
export function createConfigSource({ environment }: { environment: Dictionary }): ConfigSource {
  const source: Dictionary = {};

  // берем все переменные из предоставленной среды
  if (typeof process !== 'undefined') {
    Object.assign(source, environment);
  }

  // докидываем зашиваемые переменные окружения
  if (typeof __ISOMORPH_ENV__ !== 'undefined') {
    Object.assign(source, __ISOMORPH_ENV__);
  }

  return new Env(source);
}