/* eslint-disable require-jsdoc, jsdoc/require-jsdoc  */
import { createPreset, Resolve } from '../../di';
import { KnownToken } from '../../tokens';
import { createBaseConfig } from '../../config/base';
import { createConfigSource } from '../../config/browser';
import { Logger, createLogger } from '../../logger';
import { createSentryHandler } from '../../logger/handler/sentry';
import { createSagaMiddleware, SagaExtendedMiddleware } from '../../utils/redux-saga';
import { BrowserClient, defaultIntegrations, Hub } from '@sentry/browser';
import { create } from 'middleware-axios';
import type { BaseConfig } from '../../config/types';
import { BridgeClientSide, SsrBridge } from '../../utils/ssr';
import { StrictMap, KnownHttpApiKey } from '../types';
import { HttpApiHostPool } from '../utils';

export function PresetBrowser() {
  return createPreset([
    [KnownToken.Config.source, createConfigSource],
    [KnownToken.Config.base, provideBaseConfig],
    [KnownToken.logger, provideLogger],
    [KnownToken.sagaMiddleware, provideSagaMiddleware],
    [KnownToken.Http.Client.factory, () => create],
    [KnownToken.SsrBridge.clientSide, provideBridgeClientSide],
    [KnownToken.Http.Api.knownHosts, provideKnownHttpApiHosts],
  ]);
}

export function provideBaseConfig(resolve: Resolve): BaseConfig {
  const source = resolve(KnownToken.Config.source);

  return createBaseConfig(source);
}

export function provideLogger(resolve: Resolve): Logger {
  const source = resolve(KnownToken.Config.source);

  const client = new BrowserClient({
    dsn: source.require('SENTRY_CLIENT_DSN'),
    release: source.require('SENTRY_RELEASE'),
    environment: source.require('SENTRY_ENVIRONMENT'),
    integrations: [...defaultIntegrations],
  });

  const hub = new Hub(client);

  const logger = createLogger();

  logger.subscribe(createSentryHandler(hub));

  return logger;
}

export function provideSagaMiddleware(resolve: Resolve): SagaExtendedMiddleware {
  const logger = resolve(KnownToken.logger);

  return createSagaMiddleware(logger);
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
