/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import path from 'path';
import type { Logger, LoggerEventHandler } from '../../log/types';
import type { Tracer } from '@opentelemetry/api';
import { Resolve, Preset, createPreset } from '../../di';
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  SpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { KnownToken } from '../../tokens';
import { ConfigSource, createConfigSource } from '../../config';
import { createLogger } from '../../log';
import { createPinoHandler } from '../../log/handler/pino';
import { createSentryHandler } from '../../log/handler/sentry';
import { logMiddleware } from '../../http-server/middleware/log';
import { tracingMiddleware } from '../../http-server/middleware/tracing';
import {
  renderMetricsMiddleware,
  responseMetricsMiddleware,
} from '../../http-server/middleware/metrics';
import { createDefaultMetrics, createMetricsHttpApp } from '../../metrics/node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { create } from 'middleware-axios';
import Express, { Handler } from 'express';
import { init, Handlers, getCurrentHub } from '@sentry/node';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { getConventionalResource } from '../../tracing';
import { hostname } from 'os';
import { BridgeServerSide, SsrBridge } from '../../utils/ssr';
import { StrictMap, KnownHttpApiKey } from '../parts/types';
import { HttpApiHostPool } from '../parts/utils';
import { provideBaseConfig } from '../parts/providers';
import pino from 'pino';
import PinoPretty from 'pino-pretty';
import { config as applyDotenv } from 'dotenv';
import { composeMiddleware } from '../../http-server/utils';

/**
 * Возвращает preset с зависимостями по умолчанию для frontend-микросервисов на Node.js.
 * @return Preset.
 */
export function PresetNode(): Preset {
  return createPreset([
    // config
    [KnownToken.Config.source, provideConfigSource],
    [KnownToken.Config.base, provideBaseConfig],

    // log
    [KnownToken.logger, provideLogger],

    // tracing
    [KnownToken.Tracing.tracer, provideTracer],
    [KnownToken.Tracing.spanExporter, provideSpanExporter],
    [KnownToken.Tracing.tracerProvider, provideTracerProvider],
    [KnownToken.Tracing.tracerProviderResource, provideTracerProviderResource],

    // metrics
    [KnownToken.Metrics.httpApp, createMetricsHttpApp],

    // http client
    [KnownToken.Http.Client.factory, () => create],

    // http server
    [KnownToken.Http.Server.factory, () => Express],
    [KnownToken.Http.Server.Middleware.request, () => Handlers.requestHandler()],
    [KnownToken.Http.Server.Middleware.log, provideHttpServerLogMiddleware],
    [KnownToken.Http.Server.Middleware.metrics, provideHttpServerMetricsMiddleware],
    [KnownToken.Http.Server.Middleware.tracing, provideHttpServerTracingMiddleware],
    [KnownToken.Http.Server.Middleware.error, () => Handlers.errorHandler()],

    // http api
    [KnownToken.Http.Api.knownHosts, provideKnownHttpApiHosts],

    // ssr bridge
    [KnownToken.SsrBridge.serverSide, provideBridgeServerSide],
  ]);
}

export function provideConfigSource(): ConfigSource {
  const envName = process.env.NODE_ENV;

  // подключаем соответствующий среде файл со значениями по умолчанию
  if (envName) {
    applyDotenv({ path: path.resolve(process.cwd(), `./.env.${envName}`) });
  }

  return createConfigSource({
    environment: process.env,
  });
}

export function provideLogger(resolve: Resolve): Logger {
  const logger = createLogger();

  // @todo возможно надо придумать как не давать вызывать провайдеры внутри провайдеров
  logger.subscribe(providePinoHandler(resolve));
  logger.subscribe(provideSentryHandler(resolve));

  return logger;
}

export function provideSentryHandler(resolve: Resolve): LoggerEventHandler {
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

export function providePinoHandler(resolve: Resolve): LoggerEventHandler {
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

  const exporter = new JaegerExporter({
    host: source.require('JAEGER_AGENT_HOST'),
    port: parseInt(source.require('JAEGER_AGENT_PORT')) || undefined,
  });

  return exporter;
}

export function provideTracerProvider(resolve: Resolve): BasicTracerProvider {
  const exporter = resolve(KnownToken.Tracing.spanExporter);
  const resource = resolve(KnownToken.Tracing.tracerProviderResource);

  const provider = new NodeTracerProvider({
    resource,
  });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));

  provider.register({
    propagator: new JaegerPropagator(),
  });

  return provider;
}

export function provideTracerProviderResource(resolve: Resolve): Resource {
  const config = resolve(KnownToken.Config.base);

  return getConventionalResource(config).merge(
    new Resource({
      [SemanticResourceAttributes.HOST_NAME]: hostname(),
    }),
  );
}

export function provideHttpServerLogMiddleware(resolve: Resolve): Handler {
  const config = resolve(KnownToken.Config.base);
  const logger = resolve(KnownToken.logger);

  return logMiddleware(config, logger);
}

export function provideHttpServerMetricsMiddleware(resolve: Resolve): Handler {
  const config = resolve(KnownToken.Config.base);
  const metrics = createDefaultMetrics();

  return composeMiddleware([
    responseMetricsMiddleware(config, {
      counter: metrics.requestCount,
      histogram: metrics.responseDuration,
    }),
    renderMetricsMiddleware(config, {
      histogram: metrics.renderDuration,
    }),
  ]);
}

export function provideHttpServerTracingMiddleware(resolve: Resolve): Handler {
  const tracer = resolve(KnownToken.Tracing.tracer);

  return tracingMiddleware(tracer);
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
