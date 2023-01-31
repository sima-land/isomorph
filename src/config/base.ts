import type { ConfigSource, BaseConfig } from './types';

/**
 * Возвращает новую базовую конфигурацию.
 * @param source Источник конфигурации.
 * @return Базовая конфигурация.
 */
export function createBaseConfig(source: ConfigSource): BaseConfig {
  const env = source.require('NODE_ENV');
  const appName = source.require('APP_NAME');
  const appVersion = source.require('APP_VERSION');

  return {
    env,
    appName,
    appVersion,
  };
}
