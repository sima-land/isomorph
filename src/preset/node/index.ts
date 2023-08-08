/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import type { ConventionalFluentInfo, Logger, LogHandler } from '../../log/types';
import { BridgeServerSide, SsrBridge } from '../../utils/ssr';
import { ConfigSource, createConfigSource } from '../../config';
import { createLogger } from '../../log';
import { createPinoHandler } from '../../log/handler/pino';
import { createSentryHandler } from '../../log/handler/sentry';
import { getClientIp, HttpApiHostPool } from '../parts/utils';
import { KnownToken } from '../../tokens';
import { provideBaseConfig } from '../parts/providers';
import { Resolve, Preset, createPreset } from '../../di';
import { StrictMap, KnownHttpApiKey, PresetTuner } from '../parts/types';
import { healthCheck } from '../../http-server/handler/health-check';
import { toMilliseconds } from '../../utils/number';
import { RESPONSE_EVENT } from '../../http-server/constants';

// Node.js specific packages
import os from 'node:os';
import path from 'node:path';

// Node.js libraries (not isomorphic)
import { config as applyDotenv } from 'dotenv';
import { create } from 'middleware-axios';
import { init, Handlers, getCurrentHub } from '@sentry/node';
import * as PromClient from 'prom-client';
import Express, { Application, Handler, Request, Response } from 'express';
import pino from 'pino';
import PinoPretty from 'pino-pretty';

// opentelemetry
import { propagation, ROOT_CONTEXT, trace, type Tracer } from '@opentelemetry/api';
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  SpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

/**
 * Возвращает preset с зависимостями по умолчанию для frontend-микросервисов на Node.js.
 * @param customize Получит функцию с помощью которой можно переопределить предустановленные провайдеры.
 * @return Preset.
 */
export function PresetNode(customize?: PresetTuner): Preset {
  // ВАЖНО: используем .set() вместо аргумента defaults функции createPreset из-за скорости
  const preset = createPreset();

  // config
  preset.set(KnownToken.Config.source, provideConfigSource);
  preset.set(KnownToken.Config.base, provideBaseConfig);

  // log
  preset.set(KnownToken.logger, provideLogger);

  // tracing
  preset.set(KnownToken.Tracing.tracer, provideTracer);
  preset.set(KnownToken.Tracing.spanExporter, provideSpanExporter);
  preset.set(KnownToken.Tracing.tracerProvider, provideTracerProvider);
  preset.set(KnownToken.Tracing.tracerProviderResource, provideTracerProviderResource);

  // metrics
  preset.set(KnownToken.Metrics.httpApp, provideMetricsHttpApp);

  // http client
  preset.set(KnownToken.Http.Client.factory, () => create);

  // http server
  preset.set(KnownToken.Http.Server.factory, () => Express);
  preset.set(KnownToken.Http.Server.Handlers.healthCheck, () => healthCheck());
  preset.set(KnownToken.Http.Server.Middleware.request, () => Handlers.requestHandler());
  preset.set(KnownToken.Http.Server.Middleware.log, provideHttpServerLogMiddleware);
  preset.set(KnownToken.Http.Server.Middleware.metrics, provideHttpServerMetricsMiddleware);
  preset.set(KnownToken.Http.Server.Middleware.tracing, provideHttpServerTracingMiddleware);
  preset.set(KnownToken.Http.Server.Middleware.error, () => Handlers.errorHandler());

  // http api
  preset.set(KnownToken.Http.Api.knownHosts, provideKnownHttpApiHosts);

  // ssr bridge
  preset.set(KnownToken.SsrBridge.serverSide, provideBridgeServerSide);

  if (customize) {
    customize({ override: preset.set.bind(preset) });
  }

  return preset;
}

export function provideConfigSource(): ConfigSource {
  const envName = process.env.NODE_ENV;

  // подключаем соответствующий среде файл со значениями по умолчанию
  if (envName) {
    applyDotenv({ path: path.resolve(process.cwd(), `./.env.${envName}`) });
  }

  return createConfigSource(process.env);
}

export function provideLogger(resolve: Resolve): Logger {
  const logger = createLogger();

  // @todo возможно надо придумать как не давать вызывать провайдеры внутри провайдеров
  logger.subscribe(providePinoHandler(resolve));
  logger.subscribe(provideSentryHandler(resolve));

  return logger;
}

export function provideSentryHandler(resolve: Resolve): LogHandler {
  const source = resolve(KnownToken.Config.source);

  // экспериментально пробуем не использовать вручную созданный клиент
  init({
    dsn: source.require('SENTRY_DSN'),
    release: source.require('SENTRY_RELEASE'),
    environment: source.require('SENTRY_ENVIRONMENT'),
  });

  // ВАЖНО: передаем функцию чтобы брать текущий hub в момент вызова метода logger'а
  // это нужно чтобы хлебные крошки в ошибках Sentry группировались по запросам
  return createSentryHandler(getCurrentHub);
}

export function providePinoHandler(resolve: Resolve): LogHandler {
  const config = resolve(KnownToken.Config.base);

  const pinoLogger = pino(
    config.env === 'production'
      ? {
          formatters: {
            // ВАЖНО: для Fluent необходимо наличие поля level: string
            level: label => ({ level: label }),
          },
        }
      : PinoPretty({
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss.l o',
        }),
  );

  return createPinoHandler(pinoLogger);
}

export function provideTracer(resolve: Resolve): Tracer {
  const config = resolve(KnownToken.Config.base);
  const provider = resolve(KnownToken.Tracing.tracerProvider);

  return provider.getTracer(config.appName, config.appVersion);
}

export function provideSpanExporter(resolve: Resolve): SpanExporter {
  const source = resolve(KnownToken.Config.source);

  return new OTLPTraceExporter({
    url: source.require('JAEGER_AGENT_URL'),
  });
}

export function provideTracerProvider(resolve: Resolve): BasicTracerProvider {
  const exporter = resolve(KnownToken.Tracing.spanExporter);
  const resource = resolve(KnownToken.Tracing.tracerProviderResource);

  const provider = new NodeTracerProvider({ resource });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  provider.register({ propagator: new JaegerPropagator() });

  return provider;
}

export function provideTracerProviderResource(resolve: Resolve): Resource {
  const config = resolve(KnownToken.Config.base);

  return new Resource({
    [SemanticResourceAttributes.HOST_NAME]: os.hostname(),
    [SemanticResourceAttributes.SERVICE_NAME]: config.appName,
    [SemanticResourceAttributes.SERVICE_VERSION]: config.appVersion,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.env,
  });
}

export function provideHttpServerLogMiddleware(resolve: Resolve): Handler {
  const config = resolve(KnownToken.Config.base);
  const logger = resolve(KnownToken.logger);

  return (req, res, next) => {
    const start = process.hrtime.bigint();
    const remoteIp = getClientIp(req) ?? '';

    const startMsg: Omit<ConventionalFluentInfo, 'latency' | 'status'> & { type: string } = {
      type: 'http.request[incoming]',
      version: config.appVersion,
      route: req.originalUrl,
      method: req.method,
      remote_ip: remoteIp,
    };

    logger.info(startMsg);

    res.once('finish', () => {
      const finish = process.hrtime.bigint();

      const finishMsg: ConventionalFluentInfo & { type: string } = {
        type: 'http.response[outgoing]',
        version: config.appVersion,
        route: req.originalUrl,
        method: req.method,
        status: res.statusCode,
        remote_ip: remoteIp,
        latency: toMilliseconds(finish - start),
      };

      logger.info(finishMsg);
    });

    next();
  };
}

export function provideHttpServerMetricsMiddleware(resolve: Resolve): Handler {
  const config = resolve(KnownToken.Config.base);

  const ConventionalLabels = {
    HTTP_RESPONSE: ['version', 'route', 'code', 'method'],
    SSR: ['version', 'route', 'method'],
  } as const;

  const requestCount = new PromClient.Counter({
    name: 'http_request_count',
    help: 'Incoming HTTP request count',
    labelNames: ConventionalLabels.HTTP_RESPONSE,
  });

  const responseDuration = new PromClient.Histogram({
    name: 'http_response_duration_ms',
    help: 'Duration of incoming HTTP requests in ms',
    labelNames: ConventionalLabels.HTTP_RESPONSE,
    buckets: [30, 100, 200, 500, 1000, 2500, 5000, 10000],
  });

  const renderDuration = new PromClient.Histogram({
    name: 'render_duration_ms',
    help: 'Duration of SSR ms',
    labelNames: ConventionalLabels.SSR,
    buckets: [0.1, 15, 50, 100, 250, 500, 800, 1500],
  });

  const getLabels = (
    req: Request,
    res: Response,
  ): Record<(typeof ConventionalLabels.HTTP_RESPONSE)[number], string | number> => ({
    version: config.appVersion,
    route: req.baseUrl + req.path,
    code: res.statusCode,
    method: req.method,
  });

  return (req, res, next) => {
    const responseStart = process.hrtime.bigint();

    requestCount.inc(getLabels(req, res), 1);

    res.once(RESPONSE_EVENT.renderStart, () => {
      const renderStart = process.hrtime.bigint();

      res.once(RESPONSE_EVENT.renderFinish, () => {
        const renderFinish = process.hrtime.bigint();

        renderDuration.observe(
          {
            version: config.appVersion,
            method: req.method,
            route: req.baseUrl + req.path,
          },
          toMilliseconds(renderStart - renderFinish),
        );
      });
    });

    res.once('finish', () => {
      const responseFinish = process.hrtime.bigint();

      responseDuration.observe(getLabels(req, res), toMilliseconds(responseFinish - responseStart));
    });

    next();
  };
}

export function provideHttpServerTracingMiddleware(resolve: Resolve): Handler {
  const tracer = resolve(KnownToken.Tracing.tracer);

  /**
   * Возвращает набор стандартных атрибутов для спана.
   * @param req Входящий http-запрос.
   * @return Атрибуты.
   */
  const getConventionalRequestAttrs = (req: Request): Record<string, string | undefined> => {
    const result: Record<string, string | undefined> = {
      'request.path': req.originalUrl,
    };

    for (const headerName in req.headers) {
      if (headerName.toLowerCase().startsWith('simaland-')) {
        result[headerName] = req.header(headerName);
      }
    }

    return result;
  };

  return (req, res, next) => {
    const externalContext = propagation.extract(ROOT_CONTEXT, req.headers);
    const rootSpan = tracer.startSpan('response', undefined, externalContext);

    rootSpan.setAttributes(getConventionalRequestAttrs(req));

    const rootContext = trace.setSpan(externalContext, rootSpan);

    res.locals.tracing = {
      rootSpan,
      rootContext,
      renderSpan: null,
    };

    res.once(RESPONSE_EVENT.renderStart, () => {
      res.locals.tracing.renderSpan = tracer.startSpan('render', undefined, rootContext);

      res.once(RESPONSE_EVENT.renderFinish, () => {
        res.locals.tracing.renderSpan.end();
      });
    });

    res.once('finish', () => {
      rootSpan.end();
    });

    next();
  };
}

export function provideBridgeServerSide(resolve: Resolve): BridgeServerSide {
  const config = resolve(KnownToken.Config.base);

  return SsrBridge.prepare(config.appName);
}

export function provideKnownHttpApiHosts(resolve: Resolve): StrictMap<KnownHttpApiKey> {
  const source = resolve(KnownToken.Config.source);

  return new HttpApiHostPool(
    {
      ilium: 'API_URL_ILIUM',
      simaV3: 'API_URL_SIMALAND_V3',
      simaV4: 'API_URL_SIMALAND_V4',
      simaV6: 'API_URL_SIMALAND_V6',
    },
    source,
  );
}

export function provideMetricsHttpApp(): Application {
  PromClient.collectDefaultMetrics();

  const app = Express();

  app.get('/', async function (req, res) {
    const metrics = await PromClient.register.metrics();

    res.setHeader('Content-Type', PromClient.register.contentType);
    res.send(metrics);
  });

  return app;
}
