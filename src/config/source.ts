import type { ConfigSource, Dictionary } from './types';

// @ts-expect-error: https://github.com/humanwhocodes/env/issues/133 (@todo разобраться и убрать)
import { Env } from '@humanwhocodes/env';

declare const __ISOMORPH_ENV__: unknown;

/**
 * Возвращает новый источник конфигурации.
 * @param dictionary Опции.
 * @return Источник.
 */
export function createConfigSource(dictionary: Dictionary): ConfigSource {
  const source: Dictionary = {};

  // берем все переменные из предоставленной среды
  Object.assign(source, dictionary);

  // докидываем зашиваемые переменные окружения
  if (typeof __ISOMORPH_ENV__ !== 'undefined') {
    Object.assign(source, __ISOMORPH_ENV__);
  }

  return new Env(source);
}
