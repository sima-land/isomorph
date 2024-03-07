import { createPreset } from '../../di';
import { KnownToken } from '../../tokens';
import { PresetTuner } from '../isomorphic';
import { provideBaseConfig } from '../isomorphic/providers';
import { provideKnownHttpApiHosts, provideSsrBridgeServerSide } from '../node/providers';
import { BunProviders } from './providers';

/**
 * Возвращает preset с зависимостями для запуска приложения в Bun.
 * @param customize Получит функцию с помощью которой можно переопределить предустановленные провайдеры.
 * @return Preset.
 */
export function PresetBun(customize?: PresetTuner) {
  // @todo возможно стоит переименовать в PresetServer (так как в теории это можно использовать не только в Bun но и в Deno, Node.js)
  const preset = createPreset();

  // config
  preset.set(KnownToken.Config.source, BunProviders.configSource);
  preset.set(KnownToken.Config.base, provideBaseConfig);

  // log
  preset.set(KnownToken.logger, BunProviders.logger);

  // tracing
  // @todo

  // metrics
  preset.set(KnownToken.Metrics.httpHandler, BunProviders.serveMetrics);

  // http fetch
  preset.set(KnownToken.Http.fetch, BunProviders.fetch);
  preset.set(KnownToken.Http.Fetch.middleware, BunProviders.fetchMiddleware);

  // http serve
  preset.set(KnownToken.Http.serve, BunProviders.serve);
  preset.set(KnownToken.Http.Serve.serviceRoutes, BunProviders.serviceRoutes);
  preset.set(KnownToken.Http.Serve.middleware, BunProviders.serveMiddleware);

  // http api
  preset.set(KnownToken.Http.Api.knownHosts, provideKnownHttpApiHosts);

  // ssr bridge
  preset.set(KnownToken.SsrBridge.serverSide, provideSsrBridgeServerSide);

  if (customize) {
    customize({ override: preset.set.bind(preset) });
  }

  return preset;
}

export { HandlerProvider } from './utils';
