import type { Sauce } from '@sima-land/isomorph/http-client/sauce';

export type Api = ReturnType<typeof createApi>;

export interface HttpClientPool {
  simaV3: Sauce;
}

export function createApi(pool: HttpClientPool) {
  return {
    getCurrencies() {
      return pool.simaV3.get<any>('currency/');
    },
    getUser() {
      return pool.simaV3.get<any>('user/');
    },
  };
}
