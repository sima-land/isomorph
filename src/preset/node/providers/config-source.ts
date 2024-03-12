import path from 'node:path';
import { config as applyDotenv } from 'dotenv';
import { ConfigSource, createConfigSource } from '../../../config';

/**
 * Провайдер источника конфигурации.
 * @return Источник конфигурации.
 */
export function provideConfigSource(): ConfigSource {
  const envName = process.env.NODE_ENV;

  // подключаем соответствующий среде файл со значениями по умолчанию
  if (envName) {
    applyDotenv({ path: path.resolve(process.cwd(), `./.env.${envName}`) });
  }

  // @todo подключать .env, .env.local, .env.<envName>, .env.<envName>.local как в Vite/Bun

  return createConfigSource(process.env);
}
