import type { ConfigSource } from './types';
import { Env } from '@humanwhocodes/env';
import { config } from 'dotenv';
import path from 'path';

declare const __ISOMORPH_ENV__: unknown;

/**
 * Возвращает новый источник конфигурации для Node.js.
 * @return Источник.
 */
export function createConfigSource(): ConfigSource {
  const envName = process.env.NODE_ENV;

  // подключаем соответствующий среде файл со значениями по умолчанию
  if (envName) {
    config({ path: path.resolve(process.cwd(), `./.env.${envName}`) });
  }

  // после подключения env-файла формируем источник данных окружения
  const source: Record<string, string | undefined> = { ...process.env };

  // докидываем зашиваемые переменные окружения
  if (typeof __ISOMORPH_ENV__ !== 'undefined') {
    Object.assign(source, __ISOMORPH_ENV__);
  }

  return new Env(source);
}
