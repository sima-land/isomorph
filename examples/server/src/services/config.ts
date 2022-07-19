import type { ConfigSource } from '@sima-land/isomorph/config/types';

export interface Config {
  mainPort: number;
  metricsPort: number;
}

export function createConfig(source: ConfigSource): Config {
  return {
    mainPort: Number(source.require('MAIN_HTTP_PORT')) || -1,
    metricsPort: Number(source.require('METRICS_HTTP_PORT')) || -1,
  };
}
