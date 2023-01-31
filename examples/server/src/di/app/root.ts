import express, { Application as ExpressApp } from 'express';
import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { Config } from '../../types';
import { PresetNode } from '@sima-land/isomorph/preset/node';
import { KnownToken } from '@sima-land/isomorph/tokens';
import { TOKEN } from '../tokens';
import { DesktopApp } from './desktop';
import { MobileApp } from './mobile';
import { HandlerProvider } from '@sima-land/isomorph/preset/node/response';
import { healthCheck } from '@sima-land/isomorph/http-server/handler/health-check';

export function RootApp() {
  const app = createApplication();

  app.preset(PresetNode());

  app.bind(TOKEN.Root.config).toProvider(provideConfig);
  app.bind(TOKEN.Root.mainServer).toProvider(provideHttpApp);
  app.bind(TOKEN.Root.mobileHandler).toProvider(HandlerProvider(MobileApp));
  app.bind(TOKEN.Root.desktopHandler).toProvider(HandlerProvider(DesktopApp));

  return app;
}

function provideConfig(resolve: Resolve): Config {
  const source = resolve(KnownToken.Config.source);

  return {
    mainPort: Number(source.require('MAIN_HTTP_PORT')) || -1,
    metricsPort: Number(source.require('METRICS_HTTP_PORT')) || -1,
  };
}

function provideHttpApp(resolve: Resolve): ExpressApp {
  const desktop = resolve(TOKEN.Root.desktopHandler);
  const mobile = resolve(TOKEN.Root.mobileHandler);
  const createServer = resolve(KnownToken.Http.Server.factory);
  const middleware = resolve(KnownToken.Http.Server.Defaults.middleware);

  const app = createServer();

  app.use(express.static('dist/static'));
  app.use(
    ['/', '/desktop', '/mobile'],
    [
      ...middleware.start,
      ...middleware.logging,
      ...middleware.metrics,
      ...middleware.tracing,
      ...middleware.finish,
    ],
  );

  app.get(['/', '/desktop'], desktop);
  app.get(['/mobile'], mobile);
  app.get('/healthcheck', healthCheck());

  return app;
}
