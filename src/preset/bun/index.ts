import { createPreset } from '../../di';
import { KnownToken } from '../../tokens';
import { PresetTuner } from '../isomorphic';
import { provideBaseConfig } from '../isomorphic/providers/base-config';
import { provideFetch } from '../isomorphic/providers/fetch';
import { provideKnownHttpApiHosts } from '../server/providers/known-http-api-hosts';
import { provideSsrBridgeServerSide } from '../server/providers/ssr-bridge-server-side';
import { provideConfigSource } from './providers/config-source';
import { provideLogger } from './providers/logger';
import { provideServe } from '../server/providers/serve';
import { provideServeMetrics } from './providers/serve-metrics';
import { provideFetchMiddleware } from '../server/providers/fetch-middleware';
import { provideServiceRoutes } from './providers/service-routes';
import { provideServeMiddleware } from './providers/serve-middleware';

/**
 * Возвращает preset с зависимостями для запуска приложения в Bun.
 * @param customize Получит функцию с помощью которой можно переопределить предустановленные провайдеры.
 * @return Preset.
 */
export function PresetBun(customize?: PresetTuner) {
  // @todo возможно стоит переименовать в PresetServer (так как в теории это можно использовать не только в Bun но и в Deno, Node.js)
  const preset = createPreset();

  // config
  preset.set(KnownToken.Config.source, provideConfigSource);
  preset.set(KnownToken.Config.base, provideBaseConfig);

  // log
  preset.set(KnownToken.logger, provideLogger);

  // tracing
  // @todo

  // metrics
  preset.set(KnownToken.Metrics.httpHandler, provideServeMetrics);

  // http fetch
  preset.set(KnownToken.Http.fetch, provideFetch);
  preset.set(KnownToken.Http.Fetch.middleware, provideFetchMiddleware);

  // http serve
  preset.set(KnownToken.Http.serve, provideServe);
  preset.set(KnownToken.Http.Serve.serviceRoutes, provideServiceRoutes);
  preset.set(KnownToken.Http.Serve.middleware, provideServeMiddleware);
  preset.set(KnownToken.Http.Serve.Proxy.config, () => null);

  // http api
  preset.set(KnownToken.Http.Api.knownHosts, provideKnownHttpApiHosts);

  // ssr bridge
  preset.set(KnownToken.SsrBridge.serverSide, provideSsrBridgeServerSide);

  if (customize) {
    customize({ override: preset.set.bind(preset) });
  }

  return preset;
}

// доступные утилиты
export { HandlerProvider } from '../server/utils/handler-provider';
export { getStatsHandler } from './utils/get-stats-handler';
