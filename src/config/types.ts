import type { Env } from '@humanwhocodes/env';

export type ConfigSource = Env;

/**
 * Базовая информация о приложении, необходимая в большинстве мест.
 */
export interface BaseConfig {
  env: string;
  appName: string;
  appVersion: string;
}
