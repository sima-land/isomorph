import { createToken } from './di';

// ВАЖНО: чтобы токенами можно было пользоваться независимо от среды исполнения - импортировать надо только типы
import type * as express from 'express';
import type { ConfigSource, BaseConfig } from './config/types';
import type { Logger } from './log/types';
import type { Cache } from './cache/types';
import type { HttpClientFactory } from './http-client/types';
import type { LogMiddlewareHandlerInit } from './http-client/middleware/log';
import type { SagaExtendedMiddleware } from './utils/redux-saga';
import type { BridgeClientSide, BridgeServerSide } from './utils/ssr';
import type { Tracer } from '@opentelemetry/api';
import type { BasicTracerProvider, SpanExporter } from '@opentelemetry/sdk-trace-base';
import type { Resource } from '@opentelemetry/resources';
import type { ElementType, ReactNode } from 'react';

// @todo придумать как брать не из пресетов:
import type { PageAssets, HandlerContext, StrictMap, KnownHttpApiKey } from './preset/parts/types';
import type { SpecificExtras } from './preset/node/handler';

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
  // @todo переименовать в Redux.Middleware.saga?
  sagaMiddleware: createToken<SagaExtendedMiddleware>('saga-middleware'),

  // tracing
  Tracing: {
    tracer: createToken<Tracer>('tracing/tracer'),
    spanExporter: createToken<SpanExporter>('tracing/span-exporter'),
    tracerProvider: createToken<BasicTracerProvider>('tracing/tracer-provider'),

    // @todo перенести в KnownToken.Telemetry.Resource?
    tracerProviderResource: createToken<Resource>('tracing/resource'),
  },

  // metrics
  Metrics: {
    httpApp: createToken<express.Application>('metrics/http-app'),
  },

  // http
  Http: {
    Api: {
      knownHosts: createToken<StrictMap<KnownHttpApiKey>>('http/api/known-hosts'),
    },

    // @todo переименовать в Axios?
    Client: {
      factory: createToken<HttpClientFactory>('client/factory'),
      Middleware: {
        Log: {
          handler: createToken<LogMiddlewareHandlerInit>('log/handler'),
        },
      },
    },

    // @todo переименовать в Express?
    Server: {
      factory: createToken<() => express.Application>('server/factory'),
      Handlers: {
        healthCheck: createToken<express.Handler>('handler/health-check'),
      },
      Middleware: {
        request: createToken<express.Handler>('middleware/request'),
        log: createToken<express.Handler>('middleware/log'),
        tracing: createToken<express.Handler>('middleware/tracing'),
        metrics: createToken<express.Handler>('middleware/metrics'),
        error: createToken<express.ErrorRequestHandler>('middleware/error'),
      },
    },

    // @todo переименовать в ExpressHandler?
    Handler: {
      main: createToken<() => void>('handler/main'),
      context: createToken<HandlerContext>('handler/context'),
      Request: {
        specificParams: createToken<Record<string, unknown>>('request/specific-params'),
      },
      Response: {
        specificExtras: createToken<SpecificExtras>('response/specific-extras'),
      },
      Page: {
        assets: createToken<PageAssets | (() => PageAssets | Promise<PageAssets>)>('page/assets'),
        helmet: createToken<ElementType<{ children: ReactNode }>>('page/helmet'),
        render: createToken<() => JSX.Element | Promise<JSX.Element>>('page/render'),
      },
    },
  },

  // SSR
  SsrBridge: {
    clientSide: createToken<BridgeClientSide<unknown>>('ssr-bridge/client-side'),
    serverSide: createToken<BridgeServerSide>('ssr-bridge/server-side'),
  },
} as const;
