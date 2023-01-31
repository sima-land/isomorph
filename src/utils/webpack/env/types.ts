/** Опции EnvPlugin. */
export interface EnvPluginOptions {
  /** Целевая среда. */
  target?: 'auto' | 'web' | 'node';

  /** Нужно ли использоваь .env файлы. */
  dotenvUsage?: boolean;

  /** Переменные, зашиваемые из среды запуска. */
  additional?: string[];

  /** Переменные определяемые на месте. */
  define?: Record<string, string>;
}
