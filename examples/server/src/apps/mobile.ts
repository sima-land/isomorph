import type { Resolve } from '@sima-land/isomorph/container/types';
import type { PageAssets } from '@sima-land/isomorph/http-server/types';
import { PresetResponse } from '@sima-land/isomorph/preset/node/response';
import { KnownToken } from '@sima-land/isomorph/tokens';
import { prepareMobilePage } from '../pages/mobile';
import { Application } from '@sima-land/isomorph/container/application';

export function MobileApp(): Application {
  const app = new Application();

  app.preset(PresetResponse());

  app.bind(KnownToken.Response.assets).toProvider(Provide.assets);
  app.bind(KnownToken.Response.prepare).toValue(prepareMobilePage);

  return app;
}

const Provide = {
  assets(resolve: Resolve): PageAssets {
    const source = resolve(KnownToken.Config.source);

    return {
      js: source.get('MOBILE_CLIENT_ASSET_JS') || '',
      css: source.get('MOBILE_CLIENT_ASSET_CSS') || '',
    };
  },
};
