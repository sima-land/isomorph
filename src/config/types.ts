// @ts-expect-error: https://github.com/humanwhocodes/env/issues/133 (@todo разобраться и убрать)
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

/**
 * Словарь.
 */
export interface Dictionary {
  readonly [key: string]: string | undefined;
}
