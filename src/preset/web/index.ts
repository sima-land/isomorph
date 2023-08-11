/* eslint-disable require-jsdoc, jsdoc/require-jsdoc  */
import { createPreset, Preset } from '../../di';
import { KnownToken } from '../../tokens';
import { PresetTuner } from '../isomorphic/types';
import {
  provideBaseConfig,
  provideSagaMiddleware,
  provideHttpClientLogHandler,
} from '../isomorphic/providers';
import {
  provideBridgeClientSide,
  provideConfigSource,
  provideHttpClientFactory,
  provideKnownHttpApiHosts,
  provideLogger,
} from './providers';

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
  preset.set(KnownToken.sagaMiddleware, provideSagaMiddleware);
  preset.set(KnownToken.Http.Client.factory, provideHttpClientFactory);
  preset.set(KnownToken.Http.Client.Middleware.Log.handler, provideHttpClientLogHandler);
  preset.set(KnownToken.SsrBridge.clientSide, provideBridgeClientSide);
  preset.set(KnownToken.Http.Api.knownHosts, provideKnownHttpApiHosts);

  if (customize) {
    customize({ override: preset.set.bind(preset) });
  }

  return preset;
}
