import type { SauceResponse } from '@sima-land/isomorph/http-client/sauce';

export interface Config {
  mainPort: number;
  metricsPort: number;
}

export interface Api {
  getUser(): Promise<SauceResponse<{ items: User[] }>>;
  getCurrencies(): Promise<SauceResponse<{ items: Currency[] }>>;
}

export interface User {
  id: string;
  name: string;
}

export interface Currency {
  id: number;
  name: string;
  grapheme: string;
}
