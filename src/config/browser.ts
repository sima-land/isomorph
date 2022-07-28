import type { ConfigSource } from './types';
import { Env } from '@humanwhocodes/env';

declare const __ISOMORPH_ENV__: unknown;

/**
 * Возвращает новый источник конфигурации для браузера.
 * @return Источник.
 */
export function createConfigSource(): ConfigSource {
  const source: Record<string, string | undefined> = {};

  // докидываем process если он предоставлен сборкой
  if (typeof process !== 'undefined') {
    Object.assign(source, process.env);
  }

  // докидываем зашиваемые переменные окружения
  if (typeof __ISOMORPH_ENV__ !== 'undefined') {
    Object.assign(source, __ISOMORPH_ENV__);
  }

  return new Env(source);
}
