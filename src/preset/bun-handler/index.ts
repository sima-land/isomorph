/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { createPreset } from '../../di';
import { KnownToken } from '../../tokens';
import { PresetTuner } from '../isomorphic';
import {
  provideAbortController,
  provideFetch,
  provideReduxMiddlewareSaga,
} from '../isomorphic/providers';
import { providePageRender } from '../node/handler/providers';
import { SpecificExtras } from '../node/handler/utils';
import { HandlerProviders } from './providers';

export function PresetBunHandler(customize?: PresetTuner) {
  const preset = createPreset();

  // http fetch
  preset.set(KnownToken.Http.fetch, provideFetch);
  preset.set(KnownToken.Http.Fetch.abortController, provideAbortController);
  preset.set(KnownToken.Http.Fetch.cookieStore, HandlerProviders.cookieStore);
  preset.set(KnownToken.Http.Fetch.middleware, HandlerProviders.fetchMiddleware);
  preset.set(KnownToken.Http.Fetch.Middleware.Log.handler, HandlerProviders.fetchLogHandler);

  // handler
  preset.set(KnownToken.Http.Handler.main, HandlerProviders.handlerMain);
  preset.set(KnownToken.Http.Handler.Request.specificParams, HandlerProviders.specificParams);
  preset.set(KnownToken.Http.Handler.Response.specificExtras, () => new SpecificExtras());
  preset.set(KnownToken.Http.Handler.Page.assets, () => ({ js: '', css: '' }));
  preset.set(KnownToken.Http.Handler.Page.helmet, HandlerProviders.pageHelmet);
  preset.set(KnownToken.Http.Handler.Page.render, providePageRender);

  // redux saga
  preset.set(KnownToken.Redux.Middleware.saga, provideReduxMiddlewareSaga);

  if (customize) {
    customize({ override: preset.set.bind(preset) });
  }

  return preset;
}
