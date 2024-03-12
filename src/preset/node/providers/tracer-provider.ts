import type { Resolve } from '../../../di';
import type { BasicTracerProvider } from '@opentelemetry/sdk-trace-base';
import { BatchSpanProcessor, NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { JaegerPropagator } from '@opentelemetry/propagator-jaeger';
import { KnownToken } from '../../../tokens';

/**
 * Провайдер объекта BasicTracerProvider.
 * @param resolve Функция для получения зависимости по токену.
 * @return BasicTracerProvider.
 */
export function provideTracerProvider(resolve: Resolve): BasicTracerProvider {
  const exporter = resolve(KnownToken.Tracing.spanExporter);
  const resource = resolve(KnownToken.Tracing.tracerProviderResource);

  const provider = new NodeTracerProvider({ resource });

  provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  provider.register({ propagator: new JaegerPropagator() });

  return provider;
}
