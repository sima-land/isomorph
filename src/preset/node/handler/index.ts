import { Preset, createPreset } from '../../../di';
import { KnownToken } from '../../../tokens';
import { provideSagaMiddleware, provideHttpClientLogHandler } from '../../isomorphic/providers';
import { PresetTuner } from '../../isomorphic/types';
import {
  provideHttpClientFactory,
  provideHandlerMain,
  provideSpecificParams,
  providePageHelmet,
  providePageRender,
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

  // saga
  preset.set(KnownToken.sagaMiddleware, provideSagaMiddleware);

  // http client
  preset.set(KnownToken.Axios.factory, provideHttpClientFactory);
  preset.set(KnownToken.Axios.Middleware.Log.handler, provideHttpClientLogHandler);

  // http handler
  preset.set(KnownToken.ExpressHandler.main, provideHandlerMain);
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

export { HandlerProvider } from './utils';
