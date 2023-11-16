/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { createPreset } from '../../di';
import { KnownToken } from '../../tokens';
import { provideBaseConfig } from '../isomorphic/providers';
import { provideKnownHttpApiHosts, provideSsrBridgeServerSide } from '../node/node/providers';
import { ProvideBun } from './providers';

// @todo возможно стоит переменовать в PresetServer (так как в теории это можно использовать не только в Bun но и в Deno, Node.js)
export function PresetBun() {
  const preset = createPreset();

  // config
  preset.set(KnownToken.Config.source, ProvideBun.configSource);
  preset.set(KnownToken.Config.base, provideBaseConfig);

  // log
  preset.set(KnownToken.logger, ProvideBun.logger);

  // tracing
  // @todo

  // metrics
  // @todo

  // http fetch
  preset.set(KnownToken.Http.fetch, ProvideBun.fetch);
  preset.set(KnownToken.Http.Fetch.middleware, ProvideBun.fetchMiddleware);

  // http serve
  preset.set(KnownToken.Http.serve, ProvideBun.serve);
  preset.set(KnownToken.Http.Serve.middleware, ProvideBun.serveMiddleware);

  // http api
  preset.set(KnownToken.Http.Api.knownHosts, provideKnownHttpApiHosts);

  // ssr bridge
  preset.set(KnownToken.SsrBridge.serverSide, provideSsrBridgeServerSide);

  return preset;
}
