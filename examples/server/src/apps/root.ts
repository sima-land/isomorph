import type { Application as ExpressApp } from 'express';
import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { Config, createConfig } from '../services/config';
import { PresetNode } from '@sima-land/isomorph/preset/node';
import { KnownToken } from '@sima-land/isomorph/tokens';
import { Token } from '../tokens';
import { createMainServer } from '../services/http-app';
import { DesktopApp } from './desktop';
import { MobileApp } from './mobile';
import { HandlerProvider } from '@sima-land/isomorph/preset/node/response';

export function RootApp() {
  const app = createApplication();

  app.preset(PresetNode());

  app.bind(Token.Root.config).toProvider(provideConfig);
  app.bind(Token.Root.mainServer).toProvider(provideHttpApp);
  app.bind(Token.Root.mobileHandler).toProvider(HandlerProvider(MobileApp));
  app.bind(Token.Root.desktopHandler).toProvider(HandlerProvider(DesktopApp));

  return app;
}

function provideConfig(resolve: Resolve): Config {
  const source = resolve(KnownToken.Config.source);

  return createConfig(source);
}

function provideHttpApp(resolve: Resolve): ExpressApp {
  const desktop = resolve(Token.Root.desktopHandler);
  const mobile = resolve(Token.Root.mobileHandler);
  const createServer = resolve(KnownToken.Http.Server.factory);
  const middleware = resolve(KnownToken.Http.Server.Defaults.middleware);

  return createMainServer({
    createServer,
    handler: { desktop, mobile },
    middleware,
  });
}
