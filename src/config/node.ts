import { Env } from '@humanwhocodes/env';
import { config } from 'dotenv';
import { defineEnvironment } from './utils';

export function createConfigSource(): Env {
  // определяем среду
  const envName = defineEnvironment();

  // подключаем соответствующий среде файл со значениями по умолчанию
  config({ path: `./.env.${envName}` });

  return new Env(process.env);
}
