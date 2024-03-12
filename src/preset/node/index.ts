import { KnownToken } from '../../tokens';
import { provideAxiosFactory } from '../isomorphic/providers/axios-factory';
import { provideFetch } from '../isomorphic/providers/fetch';
import { provideBaseConfig } from '../isomorphic/providers/base-config';
import { Preset, createPreset } from '../../di';
import { PresetTuner } from '../isomorphic/types';
import { healthCheck } from '../../utils/express/handler/health-check';
import { provideConfigSource } from './providers/config-source';
import { provideExpressErrorMiddleware } from './providers/express-error-middleware';
import { provideExpressFactory } from './providers/express-factory';
import { provideExpressLogMiddleware } from './providers/express-log-middleware';
import { provideExpressMetricsMiddleware } from './providers/express-metrics-middleware';
import { provideExpressRequestMiddleware } from './providers/express-request-middleware';
import { provideExpressTracingMiddleware } from './providers/express-tracing-middleware';
import { provideKnownHttpApiHosts } from './providers/known-http-api-hosts';
import { provideLogger } from './providers/logger';
import { provideMetricsHttpApp } from './providers/metrics-http-app';
import { provideSpanExporter } from './providers/span-exporter';
import { provideSsrBridgeServerSide } from './providers/ssr-bridge-server-side';
import { provideTracer } from './providers/tracer';
import { provideTracerProvider } from './providers/tracer-provider';
import { provideTracerProviderResource } from './providers/tracer-provider-resource';

/**
 * Возвращает preset с зависимостями по умолчанию для frontend-микросервисов на Node.js.
 * @param customize Получит функцию с помощью которой можно переопределить предустановленные провайдеры.
 * @return Preset.
 */
export function PresetNode(customize?: PresetTuner): Preset {
  // ВАЖНО: используем .set() вместо аргумента defaults функции createPreset из-за скорости
  const preset = createPreset();

  // config
  preset.set(KnownToken.Config.source, provideConfigSource);
  preset.set(KnownToken.Config.base, provideBaseConfig);

  // log
  preset.set(KnownToken.logger, provideLogger);

  // tracing
  preset.set(KnownToken.Tracing.tracer, provideTracer);
  preset.set(KnownToken.Tracing.spanExporter, provideSpanExporter);
  preset.set(KnownToken.Tracing.tracerProvider, provideTracerProvider);
  preset.set(KnownToken.Tracing.tracerProviderResource, provideTracerProviderResource);

  // metrics
  preset.set(KnownToken.Metrics.httpApp, provideMetricsHttpApp);

  // fetch
  preset.set(KnownToken.Http.fetch, provideFetch);
  preset.set(KnownToken.Http.Fetch.middleware, () => []);

  // axios
  preset.set(KnownToken.Axios.factory, provideAxiosFactory);
  preset.set(KnownToken.Axios.middleware, () => []);

  // express
  preset.set(KnownToken.Express.factory, provideExpressFactory);
  preset.set(KnownToken.Express.Handlers.healthCheck, healthCheck);
  preset.set(KnownToken.Express.Middleware.request, provideExpressRequestMiddleware);
  preset.set(KnownToken.Express.Middleware.log, provideExpressLogMiddleware);
  preset.set(KnownToken.Express.Middleware.metrics, provideExpressMetricsMiddleware);
  preset.set(KnownToken.Express.Middleware.tracing, provideExpressTracingMiddleware);
  preset.set(KnownToken.Express.Middleware.error, provideExpressErrorMiddleware);

  // http api
  preset.set(KnownToken.Http.Api.knownHosts, provideKnownHttpApiHosts);

  // ssr bridge
  preset.set(KnownToken.SsrBridge.serverSide, provideSsrBridgeServerSide);

  if (customize) {
    customize({ override: preset.set.bind(preset) });
  }

  return preset;
}

export { HandlerProvider } from './utils/handler-provider';
