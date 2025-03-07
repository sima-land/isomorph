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
import type { ElementType, ReactNode, JSX } from 'react';
import type { KnownHttpApiKey, PageAssets } from './preset/isomorphic/types';
import type { ExpressHandlerContext, ExpressRouteList } from './preset/node/types';
import type { SpecificExtras } from './preset/server/utils/specific-extras';
import type { CreateAxiosDefaults } from 'axios';
import type { AxiosInstanceWrapper, Middleware as AxiosMiddleware } from 'middleware-axios';
import type { Handler, LogHandler, LogHandlerFactory, Middleware, ProxyOptions } from './http';
import type { HttpApiHostPool } from './preset/isomorphic/utils/http-api-host-pool';
import type {
  ServerHandlerContext,
  ServerHandler,
  ServerMiddleware,
  PageResponseFormatter,
  RenderToString,
  RouteList,
} from './preset/server/types';

/**
 * Токены компонентов.
 * Данные токены используются в DI-пресетах, доступных из пакета.
 */
export const KnownToken = {
  /** Токены компонентов конфигурации приложения. */
  Config: {
    /** Токен "источника конфигурации". */
    source: createToken<ConfigSource>('config/source'),

    /** Токен базовой конфигурации. */
    base: createToken<BaseConfig>('config/base'),

    /** Токен публичных переменных среды. */
    publicEnvs: createToken<Record<string, string | undefined>>('config/public-envs'),
  },

  /** Токен компонента кеша. */
  cache: createToken<Cache>('cache'),

  /** Токен компонента логгера. */
  logger: createToken<Logger>('logger'),

  /** Токены компонентов трассировки и телеметрии. */
  Tracing: {
    tracer: createToken<Tracer>('tracing/tracer'),
    spanExporter: createToken<SpanExporter>('tracing/span-exporter'),
    provider: createToken<BasicTracerProvider>('tracing/provider'),
    resource: createToken<Resource>('tracing/resource'),
  },

  /** Токены компонентов сбора метрик. */
  Metrics: {
    expressApp: createToken<express.Application>('metrics/express-app'),
    httpHandler: createToken<Handler>('metrics/http-handler'),
  },

  /** Токены компонентов для работы по HTTP. */
  Http: {
    /** Токены компонентов API. */
    Api: {
      /** Токен пула хостов известных HTTP API. */
      knownHosts: createToken<HttpApiHostPool<KnownHttpApiKey>>('http/api/known-hosts'),
    },

    /** Токен функции fetch. */
    fetch: createToken<typeof fetch>('fetch'),

    /** Токены компонентов формирующих работу функции fetch. */
    Fetch: {
      /** Токен AbortController для функции fetch. */
      abortController: createToken<AbortController>('fetch/abort-controller'),

      /** Токен списка промежуточных слоев для функции fetch. */
      middleware: createToken<Middleware[]>('fetch/middleware'),

      /** Токены компонентов промежуточных слоев для функции fetch. */
      Middleware: {
        /** Токены компонентов промежуточного слоя логирования. */
        Log: {
          /** Токены обработчика логирования работы функции fetch. */
          handler: createToken<LogHandler | LogHandlerFactory>('fetch/middleware/log/handler'),
        },
      },
    },

    /** Токен функции обработки входящего HTTP-запроса. */
    serve: createToken<Handler>('serve'),

    /** Токены компонентов функции обработки входящего HTTP-запроса. */
    Serve: {
      /** Токен списка маршрутов. */
      pageRoutes: createToken<RouteList>('serve/page-routes'),

      /** Токен списка "служебных" маршрутов. К "служебным" маршрутам не применяются промежуточные слои. */
      serviceRoutes: createToken<RouteList>('serve/service-routes'),

      /** Токен списка промежуточных слоев обработки входящего HTTP-запроса. */
      middleware: createToken<ServerMiddleware[]>('serve/middleware'),

      Proxy: {
        config: createToken<null | undefined | ProxyOptions | ProxyOptions[]>('proxy/config'),
      },
    },

    /** Токены компонентов обработчиков входящих HTTP-запросов. */
    Handler: {
      /** Токен главной функции (точки входа) обработчика. */
      main: createToken<ServerHandler>('handler/main'),

      /** Токен "контекста" обработчика. Контекст содержит объект запроса а также реализует EventTarget. */
      context: createToken<ServerHandlerContext & { request: Request }>('handler/context'),

      /** Токен компонентов входящего запроса. */
      Request: {
        /** Токен функции которая определяет возможные типы ответа и их приоритет. */
        acceptType: createToken<(types: string[]) => string | string[] | false>('handler/accepts'),

        /** Токен "специфичных" параметров запроса. В зависимости от реализации определит параметры на основе объекта запроса. */
        specificParams: createToken<Record<string, unknown>>('request/specific-params'),
      },

      /** Токены компонентов исходящего ответа. */
      Response: {
        /** Токен объекта для подписки на события и вызова событий ответа. */
        events: createToken<EventTarget>('response/events'),

        /** Токен "специфичных" дополнительных данных. В зависимости от реализации сформирует дополнительные данные ответа. */
        specificExtras: createToken<SpecificExtras>('response/specific-extras'),
      },

      /** Токены компонентов HTML-документа, формируемого в рамках обработчика. */
      Page: {
        /** Токен рендер-функции. */
        render: createToken<() => JSX.Element | Promise<JSX.Element>>('page/render'),

        /** Токен ассетов HTML-документа. */
        assets: createToken<PageAssets | (() => PageAssets | Promise<PageAssets>)>('page/assets'),

        /** Токен "шлема". Шлем - UI-компонент, внутри которого будет выведен результат render-функции. */
        helmet: createToken<ElementType<{ children: ReactNode }>>('page/helmet'),

        /** Токен функции, получающей jsx и возвращающей строку. */
        elementToString: createToken<RenderToString>('page/element-to-string'),

        /** Токен функции, которая вернёт данные для ответа. */
        formatResponse: createToken<PageResponseFormatter>('page/format-response'),
      },
    },
  },

  /** Токены компонентов для работы с библиотекой axios. */
  Axios: {
    /** Токен фабрики экземпляров axios. Фабрика вернет расширенный экземпляр с возможностью применять промежуточные слои. */
    factory: createToken<(config?: CreateAxiosDefaults) => AxiosInstanceWrapper>('axios/factory'),

    /** Токен промежуточных слоев. */
    middleware: createToken<AxiosMiddleware<any>[]>('axios/middleware'),

    /** Токен компонентов промежуточных слоев. */
    Middleware: {
      /** Токен компонентов слоя логирования. */
      Log: {
        /** Токен обработчика логирования. */
        handler: createToken<LogMiddlewareHandlerInit>('axios/middleware/log/handler'),
      },
    },
  },

  /** Токены компонентов для работы с библиотекой express. */
  Express: {
    /** Токен основного express-приложения. */
    app: createToken<express.Application>('express/app'),

    /** Токен списка маршрутов страниц. */
    pageRoutes: createToken<ExpressRouteList>('express/page-routes'),

    /** Токен списка служебных маршрутов. */
    serviceRoutes: createToken<ExpressRouteList>('express/service-routes'),

    /** Токен списка промежуточных слоев для публичных маршрутов. */
    middleware:
      createToken<Array<express.Handler | express.ErrorRequestHandler>>('express/middleware'),

    /** Токен списка промежуточных слоев для публичных маршрутов, которые подключаются после обработчика. */
    endMiddleware:
      createToken<Array<express.Handler | express.ErrorRequestHandler>>('express/end-middleware'),

    /** Токен фабрики express-приложений. */
    factory: createToken<() => express.Application>('express/factory'),

    /** Токен express-обработчиков. */
    Handlers: {
      /** Токен обработчика "health check". */
      healthCheck: createToken<express.Handler>('express/handler/health-check'),
    },

    /** Токены промежуточных слоев express-приложения. */
    Middleware: {
      request: createToken<express.Handler>('express/middleware/request'),
      log: createToken<express.Handler>('express/middleware/log'),
      tracing: createToken<express.Handler>('express/middleware/tracing'),
      metrics: createToken<express.Handler>('express/middleware/metrics'),
      error: createToken<express.ErrorRequestHandler>('express/middleware/error'),
    },
  },

  /** Токены компонентов express-обработчика. */
  ExpressHandler: {
    /** Токен главной функции (точки входа) обработчика. */
    main: createToken<express.Handler>('express-handler/main'),

    /** Токен "контекста" обработчика. Контекст содержит все аргументы, доступные обработчику (req, res, next). */
    context: createToken<ExpressHandlerContext>('express-handler/context'),
  },

  /** Токены компонентов для работы с библиотекой redux. */
  Redux: {
    /** Токены компонентов промежуточных слоев. */
    Middleware: {
      /** Токен промежуточного слоя redux-saga. */
      saga: createToken<SagaMiddleware>('saga-middleware'),
    },
  },

  /** Токены компонентов передачи данных страницы между клиентом и сервером. */
  SsrBridge: {
    /** Токены компонента "клиентской стороны". */
    clientSide: createToken<BridgeClientSide<unknown>>('ssr-bridge/client-side'),

    /** Токены компонента "серверной стороны". */
    serverSide: createToken<BridgeServerSide>('ssr-bridge/server-side'),
  },
} as const;
