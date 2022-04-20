import { createToken } from './container';
import type { Application } from 'express';
import type { DefaultMiddleware, ResponseContext } from './http-server/types';
import type { SagaRunner } from './saga-runner/types';
import type { Logger } from './logger/types';
import type { HttpClientFactory } from './http-client/types';
import type { BaseConfig } from './config/types';
import type { Env } from '@humanwhocodes/env';
import type { Tracer } from './tracer/types';
import type { Cache } from './cache/types';

export const KnownToken = {
  // config
  Config: {
    source: createToken<Env>('config.source'),
    base: createToken<BaseConfig>('config.base'),
  },

  // cache
  cache: createToken<Cache>('cache'),

  // logging
  logger: createToken<Logger>('logger'),

  // tracing
  tracer: createToken<Tracer>('tracer'),

  // metrics
  Metrics: {
    httpApp: createToken<Application>('metrics.http-app'),
  },

  // http
  Http: {
    Client: {
      factory: createToken<HttpClientFactory>('http.client.factory'),
    },
    Server: {
      factory: createToken<() => Application>('http.server.factory'),
      Defaults: {
        middleware: createToken<DefaultMiddleware>('http.server.defaults.middleware'),
      },
    },
  },

  // scope: response
  Response: {
    context: createToken<ResponseContext>('response/context'),
    main: createToken<() => void>('response/main'),
    prepare: createToken<() => JSX.Element | Promise<JSX.Element>>('response/prepare'),
    render: createToken<(element: JSX.Element) => string | Promise<string>>('response/render'),
    send: createToken<(markup: string) => void>('response/send'),
    sagaRunner: createToken<SagaRunner>('response/saga-runner'),
  },
} as const;
