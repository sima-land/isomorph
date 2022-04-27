import type { Tracer } from './types';
import type { BaseConfig } from '../config/types';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { BatchSpanProcessor, SpanExporter } from '@opentelemetry/tracing';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { Resource } from '@opentelemetry/resources';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';

/**
 * Возвращает новый tracer - объект для трассировки стадий различных процессов.
 * @param config Конфиг.
 * @param exporter Экспортер данных трассировки.
 * @return Tracer.
 */
export function createTracer(config: BaseConfig, exporter: SpanExporter): Tracer {
  // @todo доделать по инструкции: https://selvaganesh93.medium.com/tracing-node-js-application-with-opentelemetry-jaeger-ui-9523c0ac8453
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: config.appName,
      [SemanticResourceAttributes.SERVICE_VERSION]: config.appVersion,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.env,
    }),
  });

  // @todo выяснить, почему не сходятся типы и приходится оставлять as any
  provider.addSpanProcessor(new BatchSpanProcessor(exporter) as any);

  provider.register({
    propagator: new JaegerPropagator(),
  });

  registerInstrumentations({
    instrumentations: [new ExpressInstrumentation(), new HttpInstrumentation()],
  });

  return provider.getTracer(config.appName, config.appVersion);
}
