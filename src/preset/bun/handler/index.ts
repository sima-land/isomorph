/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { createPreset } from '../../../di';
import { KnownToken } from '../../../tokens';
import { provideSagaMiddleware } from '../../isomorphic/providers';
import { SpecificExtras } from '../../node/handler/utils';
import { HandlerProviders } from './providers';

export function PresetHandler() {
  const preset = createPreset();

  // http fetch
  preset.set(KnownToken.Http.fetch, HandlerProviders.fetch);
  preset.set(KnownToken.Http.Fetch.abortController, HandlerProviders.fetchAbortController);
  preset.set(KnownToken.Http.Fetch.middleware, HandlerProviders.fetchMiddleware);

  // handler
  preset.set(KnownToken.Http.Handler.main, HandlerProviders.handlerMain);
  preset.set(KnownToken.Http.Handler.Request.specificParams, HandlerProviders.specificParams);
  preset.set(KnownToken.Http.Handler.Response.specificExtras, () => new SpecificExtras());
  preset.set(KnownToken.Http.Handler.Page.helmet, HandlerProviders.pageHelmet);

  // redux saga
  preset.set(KnownToken.Redux.Middleware.saga, provideSagaMiddleware);

  return preset;
}

export { HandlerProvider } from './utils';
