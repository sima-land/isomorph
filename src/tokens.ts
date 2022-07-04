import { createToken } from './di';
import type { Application } from 'express';
import type {
  DefaultMiddleware,
  PageAssets,
  PageTemplate,
  ResponseContext,
} from './http-server/types';
import type { SagaExtendedMiddleware } from './utils/redux-saga';
import type { Logger } from './logger/types';
import type { HttpClientFactory } from './http-client/types';
import type { ConfigSource, BaseConfig } from './config/types';
import type { Tracer } from '@opentelemetry/api';
import type { Cache } from './cache/types';
import type { BasicTracerProvider, SpanExporter } from '@opentelemetry/tracing';
import type { Resource } from '@opentelemetry/resources';

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

  // saga runner
  sagaMiddleware: createToken<SagaExtendedMiddleware>('saga-middleware'),

  // tracing
  Tracing: {
    tracer: createToken<Tracer>('tracing.tracer'),
    spanExporter: createToken<SpanExporter>('tracing.span-exporter'),
    tracerProvider: createToken<BasicTracerProvider>('tracing.tracer-provider'),
    tracerProviderResource: createToken<Resource>('tracing.tracer-provider-resource'),
  },

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
    params: createToken<Record<string, unknown>>('response/params'),
    template: createToken<PageTemplate>('response/template'),
    context: createToken<ResponseContext>('response/context'),
    assets: createToken<PageAssets>('response/assets'),
    prepare: createToken<() => JSX.Element | Promise<JSX.Element>>('response/prepare'),
    render: createToken<(element: JSX.Element) => string | Promise<string>>('response/render'),
    main: createToken<() => void>('response/main'),
  },
} as const;
