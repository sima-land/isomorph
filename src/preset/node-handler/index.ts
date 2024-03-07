import { Preset, createPreset } from '../../di';
import { KnownToken } from '../../tokens';
import {
  provideReduxMiddlewareSaga,
  provideFetch,
  provideAbortController,
} from '../isomorphic/providers';
import { PresetTuner } from '../isomorphic/types';
import {
  provideAxiosMiddleware,
  provideAxiosLogHandler,
  provideHandlerMain,
  provideSpecificParams,
  providePageHelmet,
  providePageRender,
  provideFetchMiddleware,
  provideFetchLogHandler,
  provideCookieStore,
} from './providers';
import { SpecificExtras } from './utils';

/**
 * Возвращает preset с зависимостями по умолчанию для работы в рамках ответа на http-запрос.
 * @param customize Получит функцию с помощью которой можно переопределить предустановленные провайдеры.
 * @todo Возможно стоит переименовать в PresetPageHandler.
 * @return Preset.
 */
export function PresetHandler(customize?: PresetTuner): Preset {
  // ВАЖНО: используем .set() вместо аргумента defaults функции createPreset из-за скорости
  const preset = createPreset();

  // fetch
  preset.set(KnownToken.Http.fetch, provideFetch);
  preset.set(KnownToken.Http.Fetch.middleware, provideFetchMiddleware);
  preset.set(KnownToken.Http.Fetch.cookieStore, provideCookieStore);
  preset.set(KnownToken.Http.Fetch.abortController, provideAbortController);
  preset.set(KnownToken.Http.Fetch.Middleware.Log.handler, provideFetchLogHandler);

  // saga
  preset.set(KnownToken.Redux.Middleware.saga, provideReduxMiddlewareSaga);

  // axios
  preset.set(KnownToken.Axios.middleware, provideAxiosMiddleware);
  preset.set(KnownToken.Axios.Middleware.Log.handler, provideAxiosLogHandler);

  // express handler
  preset.set(KnownToken.ExpressHandler.main, provideHandlerMain);

  // http handler
  preset.set(KnownToken.Http.Handler.Request.specificParams, provideSpecificParams);
  preset.set(KnownToken.Http.Handler.Response.specificExtras, () => new SpecificExtras());
  preset.set(KnownToken.Http.Handler.Page.assets, () => ({ js: '', css: '' }));
  preset.set(KnownToken.Http.Handler.Page.helmet, providePageHelmet);
  preset.set(KnownToken.Http.Handler.Page.render, providePageRender);

  if (customize) {
    customize({ override: preset.set.bind(preset) });
  }

  return preset;
}
