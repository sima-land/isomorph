import type { BaseConfig } from '@sima-land/isomorph/config';

export interface AppConfig extends BaseConfig {
  http: {
    ports: {
      main: number;
      metrics: number;
    };
  };
}
