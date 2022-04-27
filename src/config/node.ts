import type { ConfigSource } from './types';
import { Env } from '@humanwhocodes/env';
import { config } from 'dotenv';
import { defineEnvironment } from './utils';

/**
 * Возвращает "источник" для конфигурации.
 * @return Источник.
 */
export function createConfigSource(): ConfigSource {
  // определяем среду
  const envName = defineEnvironment();

  // подключаем соответствующий среде файл со значениями по умолчанию
  config({ path: `./.env.${envName}` });

  return new Env(process.env);
}
