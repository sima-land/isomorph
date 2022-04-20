import { Env } from '@humanwhocodes/env';

/**
 * Возвращает "источник" для конфигурации.
 * @return Источник.
 */
export function createConfigSource(): Env {
  return new Env(process.env);
}
