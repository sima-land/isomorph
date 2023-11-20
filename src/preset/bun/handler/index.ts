/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { createPreset } from '../../../di';
import { KnownToken } from '../../../tokens';
import { PresetTuner } from '../../isomorphic';
import { provideReduxSagaMiddleware } from '../../isomorphic/providers';
import { providePageRender } from '../../node/handler/providers';
import { SpecificExtras } from '../../node/handler/utils';
import { HandlerProviders } from './providers';

export function PresetHandler(customize?: PresetTuner) {
  const preset = createPreset();

  // http fetch
  preset.set(KnownToken.Http.fetch, HandlerProviders.fetch);
  preset.set(KnownToken.Http.Fetch.abortController, HandlerProviders.fetchAbortController);
  preset.set(KnownToken.Http.Fetch.middleware, HandlerProviders.fetchMiddleware);

  // handler
  preset.set(KnownToken.Http.Handler.main, HandlerProviders.handlerMain);
  preset.set(KnownToken.Http.Handler.Request.specificParams, HandlerProviders.specificParams);
  preset.set(KnownToken.Http.Handler.Response.specificExtras, () => new SpecificExtras());
  preset.set(KnownToken.Http.Handler.Page.assets, () => ({ js: '', css: '' }));
  preset.set(KnownToken.Http.Handler.Page.helmet, HandlerProviders.pageHelmet);
  preset.set(KnownToken.Http.Handler.Page.render, providePageRender);

  // redux saga
  preset.set(KnownToken.Redux.Middleware.saga, provideReduxSagaMiddleware);

  if (customize) {
    customize({ override: preset.set.bind(preset) });
  }

  return preset;
}

export { HandlerProvider } from './utils';
