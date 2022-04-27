import type { ConfigSource } from './types';
import { Env } from '@humanwhocodes/env';

/**
 * Возвращает "источник" для конфигурации.
 * @return Источник.
 */
export function createConfigSource(): ConfigSource {
  return new Env(process.env);
}
