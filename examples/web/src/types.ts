import type { BaseConfig } from '@sima-land/isomorph/config';
import type { SauceResponse } from '@sima-land/isomorph/utils/axios';
import type { EitherResponse } from '@sima-land/isomorph/http';

export interface Config extends BaseConfig {
  devtoolsEnabled: boolean;
}

export interface Api {
  getCurrencies(): Promise<SauceResponse<{ items: CurrencyData[] }>>;
  getUser(): Promise<EitherResponse<{ items: UserData[] }>>;
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
