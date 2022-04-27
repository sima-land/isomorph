import type { Provider } from '@sima-land/isomorph/container/types';
import type { PageAssets } from '@sima-land/isomorph/http-server/types';
import { PresetResponse } from '@sima-land/isomorph/preset/node/response';
import { KnownToken } from '@sima-land/isomorph/tokens';
import { Token } from '../tokens';
import { Api, createApi } from '../services/api';
import { prepareDesktopPage } from '../pages/desktop';
import { Application } from '@sima-land/isomorph/container/application';

export function DesktopApp() {
  const app = new Application();

  app.preset(PresetResponse());

  app.bind(Token.Response.api).toProvider(provideApi);
  app.bind(KnownToken.Response.assets).toProvider(provideAssets);
  app.bind(KnownToken.Response.prepare).toProvider(providePrepare);

  return app;
}

const provideApi: Provider<Api> = resolve => {
  const ctx = resolve(KnownToken.Response.context);
  const config = resolve(KnownToken.Config.base);
  const tracer = resolve(KnownToken.tracer);
  const createClient = resolve(KnownToken.Http.Client.factory);

  return createApi({
    request: ctx.req,
    response: ctx.res,
    config,
    tracer,
    createClient,
  });
};

const providePrepare: Provider<() => Promise<JSX.Element>> = resolve => {
  const api = resolve(Token.Response.api);
  const sagaRunner = resolve(KnownToken.Response.sagaRunner);

  return () => prepareDesktopPage({ api, sagaRunner });
};

const provideAssets: Provider<PageAssets> = resolve => {
  const source = resolve(KnownToken.Config.source);

  return {
    js: source.get('DESKTOP_CLIENT_ASSET_JS') || '',
    css: source.get('DESKTOP_CLIENT_ASSET_CSS') || '',
  };
};
