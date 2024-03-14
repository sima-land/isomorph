/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { createPreset } from '../../di';
import { KnownToken } from '../../tokens';
import { PresetTuner } from '../isomorphic';
import { provideAbortController } from '../isomorphic/providers/abort-controller';
import { provideFetch } from '../isomorphic/providers/fetch';
import { provideReduxMiddlewareSaga } from '../isomorphic/providers/redux-middleware-saga';
import { providePageRender } from '../node-handler/providers/page-render';
import { provideFetchLogHandler } from './providers/fetch-log-handler';
import { provideFetchMiddleware } from './providers/fetch-middleware';
import { provideHandlerMain } from './providers/handler-main';
import { providePageHelmet } from './providers/page-helmet';
import { provideSpecificParams } from './providers/specific-params';
import { provideCookieStore } from './providers/cookie-store';
import { SpecificExtras } from '../server/utils/specific-extras';

/**
 * Возвращает preset с зависимостями для формирования обработчика входящего http-запроса.
 * @param customize Получит функцию с помощью которой можно переопределить предустановленные провайдеры.
 * @todo Возможно стоит переименовать в PresetPageHandler.
 * @return Preset.
 */
export function PresetBunHandler(customize?: PresetTuner) {
  const preset = createPreset();

  // http fetch
  preset.set(KnownToken.Http.fetch, provideFetch);
  preset.set(KnownToken.Http.Fetch.abortController, provideAbortController);
  preset.set(KnownToken.Http.Fetch.cookieStore, provideCookieStore);
  preset.set(KnownToken.Http.Fetch.middleware, provideFetchMiddleware);
  preset.set(KnownToken.Http.Fetch.Middleware.Log.handler, provideFetchLogHandler);

  // handler
  preset.set(KnownToken.Http.Handler.main, provideHandlerMain);
  preset.set(KnownToken.Http.Handler.Request.specificParams, provideSpecificParams);
  preset.set(KnownToken.Http.Handler.Response.specificExtras, () => new SpecificExtras());
  preset.set(KnownToken.Http.Handler.Page.assets, () => ({ js: '', css: '' }));
  preset.set(KnownToken.Http.Handler.Page.helmet, providePageHelmet);
  preset.set(KnownToken.Http.Handler.Page.render, providePageRender);

  // redux saga
  preset.set(KnownToken.Redux.Middleware.saga, provideReduxMiddlewareSaga);

  if (customize) {
    customize({ override: preset.set.bind(preset) });
  }

  return preset;
}
