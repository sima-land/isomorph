import type { Env } from '@humanwhocodes/env';

export type ConfigSource = Env;

export interface BaseConfig {
  env: string;
  appName: string;
  appVersion: string;
}
