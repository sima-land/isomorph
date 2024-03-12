import { createPreset, Preset } from '../../di';
import { KnownToken } from '../../tokens';
import { PresetTuner } from '../isomorphic/types';
import { provideBaseConfig } from '../isomorphic/providers/base-config';
import { provideFetch } from '../isomorphic/providers/fetch';
import { provideAxiosFactory } from '../isomorphic/providers/axios-factory';
import { provideAxiosLogHandler } from '../isomorphic/providers/axios-log-handler';
import { provideReduxMiddlewareSaga } from '../isomorphic/providers/redux-middleware-saga';
import { provideConfigSource } from './providers/config-source';
import { provideLogger } from './providers/logger';
import { provideKnownHttpApiHosts } from './providers/known-http-api-hosts';
import { provideFetchMiddleware } from './providers/fetch-middleware';
import { provideAxiosMiddleware } from './providers/axios-middleware';
import { provideSsrBridgeClientSide } from './providers/ssr-bridge-client-side';

/**
 * Возвращает preset с зависимостями для frontend-микросервисов в браузере.
 * @param customize Получит функцию с помощью которой можно переопределить предустановленные провайдеры.
 * @return Preset.
 */
export function PresetWeb(customize?: PresetTuner): Preset {
  // ВАЖНО: используем .set() вместо аргумента defaults функции createPreset из-за скорости
  const preset = createPreset();

  preset.set(KnownToken.Config.source, provideConfigSource);
  preset.set(KnownToken.Config.base, provideBaseConfig);
  preset.set(KnownToken.logger, provideLogger);
  preset.set(KnownToken.Redux.Middleware.saga, provideReduxMiddlewareSaga);
  preset.set(KnownToken.Axios.factory, provideAxiosFactory);
  preset.set(KnownToken.Axios.middleware, provideAxiosMiddleware);
  preset.set(KnownToken.Axios.Middleware.Log.handler, provideAxiosLogHandler);
  preset.set(KnownToken.SsrBridge.clientSide, provideSsrBridgeClientSide);
  preset.set(KnownToken.Http.Api.knownHosts, provideKnownHttpApiHosts);
  preset.set(KnownToken.Http.fetch, provideFetch);
  preset.set(KnownToken.Http.Fetch.middleware, provideFetchMiddleware);

  if (customize) {
    customize({ override: preset.set.bind(preset) });
  }

  return preset;
}
