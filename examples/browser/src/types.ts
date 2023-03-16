import type { BaseConfig } from '@sima-land/isomorph/config/types';
import type { SauceResponse } from '@sima-land/isomorph/http-client/sauce';

export interface Config extends BaseConfig {
  devtoolsEnabled: boolean;
}

export interface HttpApi {
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
