/* eslint-disable require-jsdoc */
import type { BaseConfig } from '../../config/types';
import type { Logger } from '../../logger/types';
import type { Tracer } from '@opentelemetry/api';
import type { DefaultMiddleware } from '../../http-server/types';
import { Provider, Preset, createPreset } from '../../di';
import { BasicTracerProvider, BatchSpanProcessor, SpanExporter } from '@opentelemetry/tracing';
import { KnownToken as Token } from '../../tokens';
import { createConfigSource } from '../../config/node';
import { createBaseConfig } from '../../config/base';
import { createLogger } from '../../logger';
import { createConsoleHandler } from '../../logger/handler/console';
import { createSentryHandler } from '../../logger/handler/sentry';
import { createSentryLib } from '../../error-tracker/node';
import { loggingMiddleware } from '../../http-server/middleware/logging';
import { tracingMiddleware } from '../../http-server/middleware/tracing';
import {
  renderMetricsMiddleware,
  responseMetricsMiddleware,
} from '../../http-server/middleware/metrics';
import { createDefaultMetrics, createMetricsHttpApp } from '../../metrics/node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { create } from 'middleware-axios';
import Express from 'express';
import { Handlers } from '@sentry/node';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { getConventionalResource } from '../../tracing/utils';

/**
 * Возвращает preset с зависимостями по умолчанию для frontend-микросервисов на Node.js.
 * @return Preset.
 */
export function PresetNode(): Preset {
  return createPreset([
    [Token.Config.source, createConfigSource],
    [Token.Config.base, provideBaseConfig],
    [Token.logger, provideLogger],
    [Token.Tracing.tracer, provideTracer],
    [Token.Tracing.spanExporter, provideSpanExporter],
    [Token.Tracing.tracerProvider, provideTracerProvider],
    [Token.Tracing.tracerProviderResource, provideTracerProviderResource],
    [Token.Http.Client.factory, () => create],
    [Token.Http.Server.factory, () => Express],
    [Token.Http.Server.Defaults.middleware, provideDefaultMiddleware],
    [Token.Metrics.httpApp, createMetricsHttpApp],
  ]);
}

export const provideBaseConfig: Provider<BaseConfig> = resolve => {
  const source = resolve(Token.Config.source);

  return createBaseConfig(source);
};

export const provideLogger: Provider<Logger> = resolve => {
  const source = resolve(Token.Config.source);
  const config = resolve(Token.Config.base);

  // @todo брать клиент и библиотеку из контейнера
  const sentry = createSentryLib({
    dsn: source.get('SENTRY_SERVER_DSN'),
    release: source.get('SENTRY_RELEASE'),
    environment: source.get('SENTRY_ENVIRONMENT'),
  });

  const logger = createLogger();
  logger.subscribe(createConsoleHandler(config));
  logger.subscribe(createSentryHandler(sentry));

  return logger;
};

export const provideTracer: Provider<Tracer> = resolve => {
  const config = resolve(Token.Config.base);
  const provider = resolve(Token.Tracing.tracerProvider);

  return provider.getTracer(config.appName, config.appVersion);
};

export const provideSpanExporter: Provider<SpanExporter> = resolve => {
  const source = resolve(Token.Config.source);

  const exporter = new JaegerExporter({
    host: source.require('JAEGER_AGENT_HOST'),
    port: parseInt(source.require('JAEGER_AGENT_PORT')) || undefined,
  });

  return exporter;
};

export const provideTracerProvider: Provider<BasicTracerProvider> = resolve => {
  const exporter = resolve(Token.Tracing.spanExporter);
  const resource = resolve(Token.Tracing.tracerProviderResource);

  const provider = new NodeTracerProvider({
    resource,
  });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter) as any); // @todo разобраться с as any

  provider.register({
    propagator: new JaegerPropagator(),
  });

  return provider as any; // @todo разобраться с as any
};

export const provideTracerProviderResource: Provider<Resource> = resolve => {
  const config = resolve(Token.Config.base);

  return getConventionalResource(config);
};

export const provideDefaultMiddleware: Provider<DefaultMiddleware> = resolve => {
  const config = resolve(Token.Config.base);
  const logger = resolve(Token.logger);
  const tracer = resolve(Token.Tracing.tracer);

  const metrics = createDefaultMetrics();

  return {
    start: [Handlers.requestHandler()],
    logging: [loggingMiddleware(config, logger)],
    tracing: [tracingMiddleware(tracer)],
    metrics: [
      responseMetricsMiddleware(config, {
        counter: metrics.requestCount,
        histogram: metrics.responseDuration,
      }),
      renderMetricsMiddleware(config, {
        histogram: metrics.renderDuration,
      }),
    ],
    finish: [Handlers.errorHandler()],
  };
};
