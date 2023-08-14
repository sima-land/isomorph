import type { BaseConfig } from '@sima-land/isomorph/config';
import type { SauceResponse } from '@sima-land/isomorph/utils/axios';

export interface Config extends BaseConfig {
  devtoolsEnabled: boolean;
}

export interface Api {
  getUser(): Promise<SauceResponse<{ items: UserData[] }>>;
  getCurrencies(): Promise<SauceResponse<{ items: CurrencyData[] }>>;
}

export interface UserData {
  id: string;
  name: string;
}

export interface CurrencyData {
  id: number;
  name: string;
  grapheme: string;
  description: string;
}
