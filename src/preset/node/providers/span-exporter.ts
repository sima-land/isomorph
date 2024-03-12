import type { Resolve } from '../../../di';
import type { SpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { KnownToken } from '../../../tokens';

/**
 * Провайдер объекта SpanExporter.
 * @param resolve Функция для получения зависимости по токену.
 * @return SpanExporter.
 */
export function provideSpanExporter(resolve: Resolve): SpanExporter {
  const source = resolve(KnownToken.Config.source);

  return new OTLPTraceExporter({
    // @todo сделать компонент ConventionalConfig и в реализации описать все переменные среды там
    url: source.require('JAEGER_AGENT_URL'),
  });
}
