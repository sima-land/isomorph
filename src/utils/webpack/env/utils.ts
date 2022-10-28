import { EnvPluginOptions } from './types';
import { readFileSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

/**
 * Формирует объект с переменными среды с учетом .env файлов.
 * @param options Опции.
 * @return Объект с переменными среды.
 */
export function defineEnv(
  options: Pick<EnvPluginOptions, 'dotenvUsage'>,
): Record<string, string | undefined> {
  const result = { ...process.env };

  if (options.dotenvUsage && process.env.NODE_ENV) {
    // @todo обрабатывать проблемы с чтением/парсингом итд
    const dotenvPath = path.join(process.cwd(), `.env.${process.env.NODE_ENV}`);
    const parsed = dotenv.parse(readFileSync(dotenvPath, 'utf-8'));

    // @todo дёрнуть бы эту логику из пакета dotenv, https://github.com/motdotla/dotenv/issues/690
    for (const key of Object.keys(parsed)) {
      if (!Object.prototype.hasOwnProperty.call(result, key)) {
        result[key] = parsed[key];
      }
    }
  }

  return result;
}

/**
 * Получив таблицу "название переменной среды >> значение переменной среды" вернёт определение для DefinePlugin.
 * @param input Таблица переменных.
 * @return Определение для DefinePlugin.
 */
export function asEnvVariables(input: Record<string, string | undefined>): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(input)) {
    if (key && typeof value === 'string') {
      result[`process.env.${key}`] = JSON.stringify(value);
    }
  }

  return result;
}
