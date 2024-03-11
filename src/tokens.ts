import { createToken } from './di';

// ВАЖНО: чтобы токенами можно было пользоваться независимо от среды исполнения - импортировать надо только типы
import type * as express from 'express';
import type { ConfigSource, BaseConfig } from './config/types';
import type { Logger } from './log/types';
import type { Cache } from './cache/types';
import type { LogMiddlewareHandlerInit } from './utils/axios/middleware/log';
import type { SagaMiddleware } from 'redux-saga';
import type { BridgeClientSide, BridgeServerSide } from './utils/ssr';
import type { Tracer } from '@opentelemetry/api';
import type { BasicTracerProvider, SpanExporter } from '@opentelemetry/sdk-trace-base';
import type { Resource } from '@opentelemetry/resources';
import type { ElementType, ReactNode } from 'react';
import type { KnownHttpApiKey, PageAssets } from './preset/isomorphic/types';
import type { ExpressHandlerContext } from './preset/node/types';
import type { SpecificExtras } from './preset/server/utils/specific-extras';
import type { CreateAxiosDefaults } from 'axios';
import type { AxiosInstanceWrapper, Middleware as AxiosMiddleware } from 'middleware-axios';
import type { CookieStore, Handler, LogHandler, LogHandlerFactory, Middleware } from './http';
import type { HttpApiHostPool } from './preset/isomorphic/utils/http-api-host-pool';
import type { ServerHandlerContext, ServerHandler, ServerMiddleware } from './preset/server/types';

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
    httpHandler: createToken<Handler>('metrics/http-handler'),
  },

  // http
  Http: {
    Api: {
      knownHosts: createToken<HttpApiHostPool<KnownHttpApiKey>>('http/api/known-hosts'),
    },

    fetch: createToken<typeof fetch>('fetch'),
    Fetch: {
      abortController: createToken<AbortController>('fetch/abort-controller'),
      cookieStore: createToken<CookieStore>('fetch/cookie-store'),
      middleware: createToken<Middleware[]>('fetch/middleware'),
      Middleware: {
        Log: {
          handler: createToken<LogHandler | LogHandlerFactory>('fetch/middleware/log/handler'),
        },
      },
    },

    serve: createToken<Handler>('serve'),
    Serve: {
      routes: createToken<Array<[string, ServerHandler]>>('serve/routes'),
      serviceRoutes: createToken<Array<[string, ServerHandler]>>('serve/service-routes'),
      middleware: createToken<ServerMiddleware[]>('serve/middleware'),
    },

    Handler: {
      main: createToken<ServerHandler>('handler/main'),
      context: createToken<ServerHandlerContext & { request: Request }>('handler/context'),
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

  // axios
  Axios: {
    factory: createToken<(config?: CreateAxiosDefaults) => AxiosInstanceWrapper>('axios/factory'),
    middleware: createToken<AxiosMiddleware<any>[]>('axios/middleware'),
    Middleware: {
      Log: {
        handler: createToken<LogMiddlewareHandlerInit>('axios/middleware/log/handler'),
      },
    },
  },

  // express
  Express: {
    factory: createToken<() => express.Application>('express/factory'),
    Handlers: {
      healthCheck: createToken<express.Handler>('express/handler/health-check'),
    },
    Middleware: {
      request: createToken<express.Handler>('express/middleware/request'),
      log: createToken<express.Handler>('express/middleware/log'),
      tracing: createToken<express.Handler>('express/middleware/tracing'),
      metrics: createToken<express.Handler>('express/middleware/metrics'),
      error: createToken<express.ErrorRequestHandler>('express/middleware/error'),
    },
  },

  // express handler
  ExpressHandler: {
    main: createToken<() => void>('express-handler/main'),
    context: createToken<ExpressHandlerContext>('express-handler/context'),
  },

  // redux
  Redux: {
    Middleware: {
      saga: createToken<SagaMiddleware>('saga-middleware'),
    },
  },

  // SSR
  SsrBridge: {
    clientSide: createToken<BridgeClientSide<unknown>>('ssr-bridge/client-side'),
    serverSide: createToken<BridgeServerSide>('ssr-bridge/server-side'),
  },
} as const;
