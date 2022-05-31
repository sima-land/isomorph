import { collectCookieMiddleware } from '@sima-land/isomorph/http-client/middleware/cookie';
import { tracingMiddleware } from '@sima-land/isomorph/http-client/middleware/tracing';
import { loggingMiddleware } from '@sima-land/isomorph/http-client/middleware/logging';
import { getRequestHeaders } from '@sima-land/isomorph/http-client/utils';
import type { HttpClientFactory } from '@sima-land/isomorph/http-client/types';
import type { Request, Response } from 'express';
import type { BaseConfig } from '@sima-land/isomorph/config/types';
import type { Tracer } from '@opentelemetry/api';
import type { Logger } from '@sima-land/isomorph/logger/types';

export type Api = ReturnType<typeof createApi>;

export function createApi({
  request,
  response,
  config,
  tracer,
  logger,
  createClient,
}: {
  request: Request;
  response: Response;
  config: BaseConfig;
  tracer: Tracer;
  logger: Logger;
  createClient: HttpClientFactory;
}) {
  const simaV3 = createClient({
    baseURL: 'https://www.sima-land.ru/api/v3/',
    headers: getRequestHeaders(config, request),
  });

  simaV3.use(collectCookieMiddleware(request, response));
  simaV3.use(tracingMiddleware(tracer, response.locals.tracing.rootContext));
  simaV3.use(loggingMiddleware(logger));

  return {
    getCurrencies() {
      return simaV3.get<any>('currency/');
    },
    getUser() {
      return simaV3.get<any>('user/');
    },
  };
}
