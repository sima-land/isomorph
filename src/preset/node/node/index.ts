import { KnownToken } from '../../../tokens';
import { provideBaseConfig } from '../../isomorphic/providers';
import { Preset, createPreset } from '../../../di';
import { PresetTuner } from '../../isomorphic/types';
import { healthCheck } from '../../../utils/express/handler/health-check';
import {
  provideConfigSource,
  provideHttpClientFactory,
  provideHttpServerErrorMiddleware,
  provideHttpServerFactory,
  provideHttpServerLogMiddleware,
  provideHttpServerMetricsMiddleware,
  provideHttpServerRequestMiddleware,
  provideHttpServerTracingMiddleware,
  provideKnownHttpApiHosts,
  provideLogger,
  provideMetricsHttpApp,
  provideSpanExporter,
  provideSsrBridgeServerSide,
  provideTracer,
  provideTracerProvider,
  provideTracerProviderResource,
} from './providers';

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

  // http client
  preset.set(KnownToken.Axios.factory, provideHttpClientFactory);

  // http server
  preset.set(KnownToken.Express.factory, provideHttpServerFactory);
  preset.set(KnownToken.Express.Handlers.healthCheck, healthCheck);
  preset.set(KnownToken.Express.Middleware.request, provideHttpServerRequestMiddleware);
  preset.set(KnownToken.Express.Middleware.log, provideHttpServerLogMiddleware);
  preset.set(KnownToken.Express.Middleware.metrics, provideHttpServerMetricsMiddleware);
  preset.set(KnownToken.Express.Middleware.tracing, provideHttpServerTracingMiddleware);
  preset.set(KnownToken.Express.Middleware.error, provideHttpServerErrorMiddleware);

  // http api
  preset.set(KnownToken.Http.Api.knownHosts, provideKnownHttpApiHosts);

  // ssr bridge
  preset.set(KnownToken.SsrBridge.serverSide, provideSsrBridgeServerSide);

  if (customize) {
    customize({ override: preset.set.bind(preset) });
  }

  return preset;
}
