import { createToken } from './container';
import type { Application } from 'express';
import type { DefaultMiddleware } from './http-server/types';
import type { Logger } from './logger/types';
import type { HttpClientFactory } from './http-client/types';
import type { BaseConfig } from './config/types';
import type { Env } from '@humanwhocodes/env';
import type { Tracer } from './tracer/types';

export const KnownToken = {
  // config
  Config: {
    source: createToken<Env>('config.source'),
    base: createToken<BaseConfig>('config.base'),
  },

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
} as const;
