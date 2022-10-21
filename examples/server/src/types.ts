import type { Sauce } from '@sima-land/isomorph/http-client/sauce';

export interface Config {
  mainPort: number;
  metricsPort: number;
}

export interface Api {
  getUser(): ReturnType<Sauce['get']>;
  getCurrencies(): ReturnType<Sauce['get']>;
}
