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
import { provideKnownHttpApiHosts } from '../server/providers/known-http-api-hosts';
import { provideLogger } from './providers/logger';
import { provideMetricsExpressApp } from './providers/metrics-express-app';
import { provideTracer } from './providers/telemetry-tracer';
import { provideSpanExporter } from './providers/telemetry-tracer-span-exporter';
import { provideSsrBridgeServerSide } from '../server/providers/ssr-bridge-server-side';
import { provideTracingProvider } from './providers/telemetry-tracer-provider';
import { provideTracingResource } from './providers/telemetry-tracer-resource';
import { provideMainExpressApp } from './providers/main-express-app';
import { ExpressRouteList } from './types';

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
  preset.set(KnownToken.Tracing.provider, provideTracingProvider);
  preset.set(KnownToken.Tracing.resource, provideTracingResource);

  // metrics
  preset.set(KnownToken.Metrics.expressApp, provideMetricsExpressApp);

  // fetch
  preset.set(KnownToken.Http.fetch, provideFetch);
  preset.set(KnownToken.Http.Fetch.middleware, () => []);
  preset.set(KnownToken.Http.Serve.Proxy.config, () => null);

  // axios
  preset.set(KnownToken.Axios.factory, provideAxiosFactory);
  preset.set(KnownToken.Axios.middleware, () => []);

  // express
  preset.set(KnownToken.Express.app, provideMainExpressApp);
  preset.set(KnownToken.Express.pageRoutes, () => []);
  preset.set(
    KnownToken.Express.serviceRoutes,
    (resolve): ExpressRouteList => [
      ['/healthcheck', resolve(KnownToken.Express.Handlers.healthCheck)],
    ],
  );
  preset.set(KnownToken.Express.middleware, resolve => [
    resolve(KnownToken.Express.Middleware.request),
    resolve(KnownToken.Express.Middleware.log),
    resolve(KnownToken.Express.Middleware.metrics),
    resolve(KnownToken.Express.Middleware.tracing),
  ]);
  preset.set(KnownToken.Express.endMiddleware, resolve => [
    resolve(KnownToken.Express.Middleware.error),
  ]);
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

export type { ExpressHandlerContext, ExpressRouteList } from './types';

// доступные утилиты
export { getClientIp } from './utils/get-client-ip';
export { getForwardedHeaders } from './utils/get-forwarded-headers';
export { getPageResponseFormat } from './utils/get-page-response-format';
export { HandlerProvider } from './utils/handler-provider';
