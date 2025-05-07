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
  const headers = source.has(`${envPrefix}HEADERS`)
    ? JSON.parse(source.get(`${envPrefix}HEADERS`, '{}'))
    : undefined;
  const url = new URL(source.get(`${envPrefix}URL`, 'http://localhost:4317'));

  if (source.has(`${envPrefix}PORT`)) url.port = source.get(`${envPrefix}PORT`, '');

  return new OTLPTraceExporter({
    url: url.toString(),
    headers,
  });
}
