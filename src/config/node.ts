import type { ConfigSource } from './types';
import { Env } from '@humanwhocodes/env';
import { config } from 'dotenv';

declare const __ISOMORPH_ENV__: unknown;

/**
 * Возвращает "источник" для конфигурации.
 * @return Источник.
 */
export function createConfigSource(): ConfigSource {
  const envName = process.env.NODE_ENV;
  const source: Record<string, string | undefined> = { ...process.env };

  // подключаем соответствующий среде файл со значениями по умолчанию
  if (envName) {
    config({ path: `./.env.${envName}` });
  }

  // докидываем зашиваемые переменные окружения
  if (typeof __ISOMORPH_ENV__ !== 'undefined') {
    Object.assign(source, __ISOMORPH_ENV__);
  }

  return new Env(source);
}
