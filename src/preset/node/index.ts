/* eslint-disable require-jsdoc */
import type { Preset } from '../types';
import type { Provider } from '../../container/types';
import type { BaseConfig } from '../../config/types';
import type { Logger } from '../../logger/types';
import type { Tracer } from '@opentelemetry/api';
import { BasicTracerProvider, BatchSpanProcessor, SpanExporter } from '@opentelemetry/tracing';
import type { DefaultMiddleware } from '../../http-server/types';
import { KnownToken as Token } from '../../tokens';
import { createPreset } from '..';
import { createConfigSource } from '../../config/node';
import { createBaseConfig } from '../../config';
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
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';

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

  const sentry = createSentryLib({
    dsn: source.get('SENTRY_DSN'),
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
  const config = resolve(Token.Config.base);
  const exporter = resolve(Token.Tracing.spanExporter);

  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: config.appName,
      [SemanticResourceAttributes.SERVICE_VERSION]: config.appVersion,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.env,
    }),
  });

  // @todo разобраться с as any
  provider.addSpanProcessor(new BatchSpanProcessor(exporter) as any);

  provider.register({ propagator: new JaegerPropagator() });

  // @todo разобраться с as any
  return provider as any;
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
