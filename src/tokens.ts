import { createToken } from './container';
import type { Application } from 'express';
import type { DefaultMiddleware, PageAssets, ResponseContext } from './http-server/types';
import type { SagaRunner } from './saga-runner/types';
import type { Logger } from './logger/types';
import type { HttpClientFactory } from './http-client/types';
import type { ConfigSource, BaseConfig } from './config/types';
import type { Tracer } from './tracer/types';
import type { Cache } from './cache/types';

export const KnownToken = {
  // config
  Config: {
    source: createToken<ConfigSource>('config.source'),
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

  // scope: page response
  Response: {
    context: createToken<ResponseContext>('response/context'),
    assets: createToken<PageAssets>('response/assets'),
    prepare: createToken<() => JSX.Element | Promise<JSX.Element>>('response/prepare'),
    render: createToken<(element: JSX.Element) => string | Promise<string>>('response/render'),
    main: createToken<() => void>('response/main'),
    sagaRunner: createToken<SagaRunner>('response/saga-runner'),
  },
} as const;
