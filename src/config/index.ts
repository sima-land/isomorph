import { Env } from '@humanwhocodes/env';
import { IBaseConfig } from './types';

export function createBaseConfig(source: Env): IBaseConfig {
  const env = source.require('NODE_ENV');
  const appName = source.require('APP_NAME');
  const appVersion = source.require('APP_VERSION');

  return {
    env,
    appName,
    appVersion,
  };
}
