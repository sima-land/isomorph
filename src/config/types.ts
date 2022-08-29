import type { Env } from '@humanwhocodes/env';

/** Источник конфигурации. */
export type ConfigSource = Env;

/**
 * Базовая информация о приложении, необходимая в большинстве мест.
 */
export interface BaseConfig {
  /** Строка, характеризующая среду выполнения, например "production". */
  env: string;

  /** Имя приложения. */
  appName: string;

  /** Версия приложения. */
  appVersion: string;
}
