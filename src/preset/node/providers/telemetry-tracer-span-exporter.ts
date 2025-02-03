import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { KnownToken } from '../../../tokens';

import type { Resolve } from '../../../di';

const envPrefix = 'OTEL_EXPORTER_OTLP_';

/**
 * Провайдер объекта SpanExporter.
 * @param resolve Функция для получения зависимости по токену.
 * @return SpanExporter.
 */
export function provideSpanExporter(resolve: Resolve): OTLPTraceExporter {
  const source = resolve(KnownToken.Config.source);

  return new OTLPTraceExporter({
    url: source.get(`${envPrefix}URL`, ''),
  });
}
