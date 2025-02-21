import type { ConfigSource, Dictionary } from './types';
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

  // докидываем публичные переменные сервиса из глобального окружения
  if (source.APP_NAME && typeof (globalThis as any)[`${source.APP_NAME}__envs`] !== 'undefined') {
    Object.assign(source, (globalThis as any)[`${source.APP_NAME}__envs`]);
  }

  return new Env(source);
}
