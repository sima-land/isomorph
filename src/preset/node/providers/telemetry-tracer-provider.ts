import type { Resolve } from "../../../di";
import type { BasicTracerProvider } from "@opentelemetry/sdk-trace-base";
import {
  BatchSpanProcessor,
  NodeTracerProvider,
} from "@opentelemetry/sdk-trace-node";
import { KnownToken } from "../../../tokens";

/**
 * Провайдер объекта BasicTracerProvider.
 * @param resolve Функция для получения зависимости по токену.
 * @return BasicTracerProvider.
 */
export function provideTracingProvider(resolve: Resolve): BasicTracerProvider {
  const exporter = resolve(KnownToken.Tracing.spanExporter);
  const resource = resolve(KnownToken.Tracing.resource);
  const provider = new NodeTracerProvider({
    resource,
    spanProcessors: [new BatchSpanProcessor(exporter)],
  });

  provider.register();

  return provider;
}
