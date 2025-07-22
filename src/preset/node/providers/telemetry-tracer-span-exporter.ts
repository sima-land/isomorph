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
  const headers = source.has(`${envPrefix}REQUEST_HEADERS`)
    ? JSON.parse(source.get(`${envPrefix}REQUEST_HEADERS`, '{}'))
    : undefined;
  
  const url = new URL(source.get(`${envPrefix}ENTRYPOINT`) || `${source.get(`${envPrefix}PROTOCOL`, 'https')}://${source.get(`${envPrefix}HOSTNAME`, 'localhost')}`);
  url.port = source.get(`${envPrefix}PORT`, url.port);

  return new OTLPTraceExporter({
    url: url.toString(),
    ...(headers && { headers }),
  });
}
