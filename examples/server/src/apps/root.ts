import type { Provider } from '@sima-land/isomorph/container/types';
import type { Application as ExpressApp, Handler } from 'express';
import { Config, createConfig } from '../services/config';
import { PresetNode } from '@sima-land/isomorph/preset/node';
import { KnownToken } from '@sima-land/isomorph/tokens';
import { Token } from '../tokens';
import { createMainServer } from '../services/http-app';
import { DesktopApp } from './desktop';
import { MobileApp } from './mobile';
import { Application } from '@sima-land/isomorph/container/application';

export function RootApp() {
  const app = new Application();

  app.preset(PresetNode());

  app.bind(Token.Root.config).toProvider(provideConfig);
  app.bind(Token.Root.mainServer).toProvider(provideHttpApp);
  app.bind(Token.Root.mobileHandler).toProvider(provideMobileHandler);
  app.bind(Token.Root.desktopHandler).toProvider(provideDesktopHandler);

  return app;
}

const provideConfig: Provider<Config> = resolve => {
  const source = resolve(KnownToken.Config.source);

  return createConfig(source);
};

const provideHttpApp: Provider<ExpressApp> = resolve => {
  const desktop = resolve(Token.Root.desktopHandler);
  const mobile = resolve(Token.Root.mobileHandler);
  const createServer = resolve(KnownToken.Http.Server.factory);
  const middleware = resolve(KnownToken.Http.Server.Defaults.middleware);

  return createMainServer({
    createServer,
    handler: { desktop, mobile },
    middleware,
  });
};

const provideDesktopHandler: Provider<Handler> = resolve => {
  const parent = resolve(Application.self);

  const handler: Handler = (req, res, next) => {
    const app = DesktopApp();

    app.attach(parent);
    app.bind(KnownToken.Response.context).toValue({ req, res, next });

    app.get(KnownToken.Response.main)();
  };

  return handler;
};

const provideMobileHandler: Provider<Handler> = resolve => {
  const parent = resolve(Application.self);

  const handler: Handler = (req, res, next) => {
    const app = MobileApp();

    app.attach(parent);
    app.bind(KnownToken.Response.context).toValue({ req, res, next });

    app.get(KnownToken.Response.main)();
  };

  return handler;
};
