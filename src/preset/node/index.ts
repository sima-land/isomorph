/* eslint-disable require-jsdoc */
import type { Preset } from '../types';
import type { Provider } from '../../container/types';
import type { BaseConfig } from '../../config/types';
import type { Logger } from '../../logger/types';
import type { Tracer } from '@opentelemetry/api';
import type { DefaultMiddleware } from '../../http-server/types';
import { KnownToken as Token } from '../../tokens';
import { createPreset } from '..';
import { createConfigSource } from '../../config/node';
import { createBaseConfig } from '../../config';
import { createLogger } from '../../logger';
import { createTracer } from '../../tracer/node';
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

/**
 * Возвращает preset с зависимостями по умолчанию для frontend-микросервисов на Node.js.
 * @return Preset.
 */
export function PresetNode(): Preset {
  return createPreset([
    [Token.Config.source, createConfigSource],
    [Token.Config.base, provideBaseConfig],
    [Token.logger, provideLogger],
    [Token.tracer, provideTracer],
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
  const source = resolve(Token.Config.source);

  const exporter = new JaegerExporter({
    endpoint: source.require('JAEGER_ENDPOINT'),
  });

  return createTracer(resolve(Token.Config.base), exporter);
};

export const provideDefaultMiddleware: Provider<DefaultMiddleware> = resolve => {
  const config = resolve(Token.Config.base);
  const logger = resolve(Token.logger);
  const tracer = resolve(Token.tracer);

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
