import React from 'react';
import type { PageAssets } from '@sima-land/isomorph/http-server/types';
import { Resolve, createApplication } from '@sima-land/isomorph/di';
import { PresetResponse } from '@sima-land/isomorph/preset/node/response';
import { KnownToken } from '@sima-land/isomorph/tokens';

export function MobileApp() {
  const app = createApplication();

  app.preset(PresetResponse());

  app.bind(KnownToken.Response.assets).toProvider(provideAssets);
  app.bind(KnownToken.Response.prepare).toProvider(providePrepare);

  return app;
}

function providePrepare() {
  return function prepareMobilePage() {
    return (
      <div>
        <h1>Example app</h1>
        <h2>Mobile version</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione, minima.</p>
      </div>
    );
  };
}

function provideAssets(resolve: Resolve): PageAssets {
  const source = resolve(KnownToken.Config.source);

  return {
    js: source.get('MOBILE_CLIENT_ASSET_JS') || '',
    css: source.get('MOBILE_CLIENT_ASSET_CSS') || '',
  };
}
