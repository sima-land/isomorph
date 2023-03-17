import { createToken } from './di';
import type { Application, ErrorRequestHandler, Handler } from 'express';
import type { PageAssets, PageTemplate, ResponseContext } from './http-server/types';
import type { SagaExtendedMiddleware } from './utils/redux-saga';
import type { Logger } from './log/types';
import type { HttpClientFactory } from './http-client/types';
import type { ConfigSource, BaseConfig } from './config/types';
import type { Tracer } from '@opentelemetry/api';
import type { Cache } from './cache/types';
import type { BasicTracerProvider, SpanExporter } from '@opentelemetry/sdk-trace-base';
import type { Resource } from '@opentelemetry/resources';
import type { StrictMap, KnownHttpApiKey } from './preset/parts/types';
import type { BridgeClientSide, BridgeServerSide } from './utils/ssr';
import type { PageResponse } from './http-server/utils';
import type { LogMiddlewareHandlerInit } from './http-client/middleware/log';

export const KnownToken = {
  // config
  Config: {
    source: createToken<ConfigSource>('config/source'),
    base: createToken<BaseConfig>('config/base'),
  },

  // cache
  cache: createToken<Cache>('cache'),

  // log
  logger: createToken<Logger>('logger'),

  // saga runner
  sagaMiddleware: createToken<SagaExtendedMiddleware>('saga-middleware'),

  // tracing
  Tracing: {
    tracer: createToken<Tracer>('tracing/tracer'),
    spanExporter: createToken<SpanExporter>('tracing/span-exporter'),
    tracerProvider: createToken<BasicTracerProvider>('tracing/tracer-provider'),
    tracerProviderResource: createToken<Resource>('tracing/resource'),
  },

  // metrics
  Metrics: {
    httpApp: createToken<Application>('metrics/http-app'),
  },

  // http
  Http: {
    Api: {
      knownHosts: createToken<StrictMap<KnownHttpApiKey>>('http/api/known-hosts'),
    },
    Client: {
      factory: createToken<HttpClientFactory>('client/factory'),
      Middleware: {
        Log: {
          handler: createToken<LogMiddlewareHandlerInit>('log/handler'),
        },
      },
    },
    Server: {
      factory: createToken<() => Application>('server/factory'),
      Middleware: {
        request: createToken<Handler>('middleware/request'),
        log: createToken<Handler>('middleware/log'),
        tracing: createToken<Handler>('middleware/tracing'),
        metrics: createToken<Handler>('middleware/metrics'),
        error: createToken<ErrorRequestHandler>('middleware/error'),
      },
    },
    Handler: {
      main: createToken<() => void>('handler/main'),
      context: createToken<ResponseContext>('handler/context'),
      Request: {
        specificParams: createToken<Record<string, unknown>>('request/specific-params'),
      },
      Response: {
        builder: createToken<PageResponse>('response/builder'),
        Page: {
          assets: createToken<PageAssets>('page/assets'),
          template: createToken<PageTemplate>('page/template'),
          prepare: createToken<() => JSX.Element | Promise<JSX.Element>>('page/prepare'),
          render: createToken<(element: JSX.Element) => string | Promise<string>>('page/render'),
        },
      },
    },
  },

  // SSR
  SsrBridge: {
    clientSide: createToken<BridgeClientSide<unknown>>('ssr-bridge/client-side'),
    serverSide: createToken<BridgeServerSide>('ssr-bridge/server-side'),
  },
} as const;
