import type { Container } from '../../container/types';
import { KnownToken as Token } from '../../tokens';
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

export function presetNodeApp(container: Container): void {
  container.set(Token.Config.source, createConfigSource);

  container.set(Token.Config.base, resolve => createBaseConfig(resolve(Token.Config.source)));

  container.set(Token.logger, resolve => {
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
  });

  container.set(Token.Http.Server.factory, () => Express);

  container.set(Token.Http.Client.factory, () => create);

  container.set(Token.tracer, resolve => {
    const source = resolve(Token.Config.source);

    const exporter = new JaegerExporter({
      endpoint: source.require('JAEGER_ENDPOINT'),
    });

    return createTracer(resolve(Token.Config.base), exporter);
  });

  container.set(Token.Http.Server.Defaults.middleware, resolve => {
    const config = resolve(Token.Config.base);
    const logger = resolve(Token.logger);
    const tracer = resolve(Token.tracer);
    const metrics = createDefaultMetrics();

    return {
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
    };
  });

  container.set(Token.Metrics.httpApp, createMetricsHttpApp);
}
