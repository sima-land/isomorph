import { getRequestHeaders } from '@sima-land/isomorph/http-client/utils';
import type { HttpClientFactory } from '@sima-land/isomorph/http-client/types';
import type { Request } from 'express';
import type { BaseConfig } from '@sima-land/isomorph/config/types';

export type Api = ReturnType<typeof createApi>;

export function createApi({
  request,
  config,
  createClient,
}: {
  request: Request;
  config: BaseConfig;
  createClient: HttpClientFactory;
}) {
  const simaV3 = createClient({
    baseURL: 'https://www.sima-land.ru/api/v3/',
    headers: getRequestHeaders(config, request),
  });

  return {
    getCurrencies() {
      return simaV3.get<any>('currency/');
    },
    getUser() {
      return simaV3.get<any>('user/');
    },
  };
}
