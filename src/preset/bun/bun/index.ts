/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { createPreset } from '../../../di';
import { KnownToken } from '../../../tokens';
import { PresetTuner } from '../../isomorphic';
import { provideBaseConfig } from '../../isomorphic/providers';
import { provideKnownHttpApiHosts, provideSsrBridgeServerSide } from '../../node/node/providers';
import { BunProviders } from './providers';

// @todo возможно стоит переименовать в PresetServer (так как в теории это можно использовать не только в Bun но и в Deno, Node.js)
export function PresetBun(customize?: PresetTuner) {
  const preset = createPreset();

  // config
  preset.set(KnownToken.Config.source, BunProviders.configSource);
  preset.set(KnownToken.Config.base, provideBaseConfig);

  // log
  preset.set(KnownToken.logger, BunProviders.logger);

  // tracing
  // @todo

  // metrics
  // @todo

  // http fetch
  preset.set(KnownToken.Http.fetch, BunProviders.fetch);
  preset.set(KnownToken.Http.Fetch.middleware, BunProviders.fetchMiddleware);

  // http serve
  preset.set(KnownToken.Http.serve, BunProviders.serve);
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
