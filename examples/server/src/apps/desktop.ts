import type { PageAssets } from '@sima-land/isomorph/http-server/types';
import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { PresetResponse } from '@sima-land/isomorph/preset/node/response';
import { KnownToken } from '@sima-land/isomorph/tokens';
import { Token } from '../tokens';
import { Api, createApi } from '../services/api';
import { prepareDesktopPage } from '../pages/desktop';
import { sauce } from '@sima-land/isomorph/http-client/sauce';

export function DesktopApp() {
  const app = createApplication();

  app.preset(PresetResponse());

  app.bind(Token.Response.api).toProvider(provideApi);
  app.bind(KnownToken.Response.assets).toProvider(provideAssets);
  app.bind(KnownToken.Response.prepare).toProvider(providePrepare);

  return app;
}

function provideApi(resolve: Resolve): Api {
  const knownHosts = resolve(KnownToken.Http.Api.knownHosts);
  const createClient = resolve(KnownToken.Http.Client.factory);

  return createApi({
    simaV3: sauce(
      createClient({
        baseURL: knownHosts.get('simaV3'),
      }),
    ),
  });
}

function providePrepare(resolve: Resolve): () => Promise<JSX.Element> {
  const config = resolve(KnownToken.Config.base);
  const api = resolve(Token.Response.api);
  const sagaMiddleware = resolve(KnownToken.sagaMiddleware);

  return () => prepareDesktopPage({ api, config, sagaMiddleware });
}

function provideAssets(resolve: Resolve): PageAssets {
  const source = resolve(KnownToken.Config.source);

  return {
    js: source.get('DESKTOP_CLIENT_ASSET_JS') || '',
    css: source.get('DESKTOP_CLIENT_ASSET_CSS') || '',
  };
}
