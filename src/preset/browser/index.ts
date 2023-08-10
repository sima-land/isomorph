/* eslint-disable require-jsdoc, jsdoc/require-jsdoc  */
import { createPreset, Resolve, Preset } from '../../di';
import { KnownToken } from '../../tokens';
import { ConfigSource, createConfigSource } from '../../config';
import { Logger, createLogger } from '../../log';
import { createSentryHandler } from '../../log/handler/sentry';
import {
  BrowserClient,
  Hub,
  defaultIntegrations,
  defaultStackParser,
  makeFetchTransport,
} from '@sentry/browser';
import { create } from 'middleware-axios';
import { BridgeClientSide, SsrBridge } from '../../utils/ssr';
import { StrictMap, KnownHttpApiKey, PresetTuner } from '../parts/types';
import { HttpApiHostPool, HttpStatus } from '../parts/utils';
import { logMiddleware } from '../../http-client/middleware/log';
import {
  provideBaseConfig,
  provideSagaMiddleware,
  provideHttpClientLogHandler,
} from '../parts/providers';
import { CreateAxiosDefaults } from 'axios';

/**
 * Возвращает preset с зависимостями по умолчанию для frontend-микросервисов в браузере.
 * @param customize Получит функцию с помощью которой можно переопределить предустановленные провайдеры.
 * @return Preset.
 */
export function PresetBrowser(customize?: PresetTuner): Preset {
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

export function provideConfigSource(): ConfigSource {
  // ВАЖНО: по умолчанию рассчитываем на process.env который предоставляется сборщиком (например webpack)
  if (typeof process !== 'undefined' && process.env) {
    return createConfigSource(process.env);
  }

  return createConfigSource({});
}

export function provideLogger(resolve: Resolve): Logger {
  const source = resolve(KnownToken.Config.source);

  const client = new BrowserClient({
    transport: makeFetchTransport,
    stackParser: defaultStackParser,
    dsn: source.require('PUBLIC_SENTRY_DSN'),
    release: source.require('SENTRY_RELEASE'),
    environment: source.require('PUBLIC_SENTRY_ENVIRONMENT'),
    integrations: [...defaultIntegrations],
  });

  const hub = new Hub(client);

  hub.setTag('url', window.location.href);

  const logger = createLogger();

  logger.subscribe(createSentryHandler(hub));

  return logger;
}

export function provideBridgeClientSide(resolve: Resolve): BridgeClientSide<unknown> {
  const config = resolve(KnownToken.Config.base);

  return SsrBridge.resolve(config.appName);
}

export function provideKnownHttpApiHosts(resolve: Resolve): StrictMap<KnownHttpApiKey> {
  const source = resolve(KnownToken.Config.source);

  return new HttpApiHostPool<KnownHttpApiKey>(
    {
      ilium: 'PUBLIC_API_URL_ILIUM',
      simaV3: 'PUBLIC_API_URL_SIMALAND_V3',
      simaV4: 'PUBLIC_API_URL_SIMALAND_V4',
      simaV6: 'PUBLIC_API_URL_SIMALAND_V6',
    },
    source,
  );
}

export function provideHttpClientFactory(resolve: Resolve) {
  const logHandler = resolve(KnownToken.Http.Client.Middleware.Log.handler);

  return function createHttpClient(config: CreateAxiosDefaults = {}) {
    // @todo убрать as any
    const client = create(config as any);

    client.use(HttpStatus.axiosMiddleware());
    client.use(logMiddleware(logHandler));

    return client;
  };
}
