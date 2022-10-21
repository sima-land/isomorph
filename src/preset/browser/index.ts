/* eslint-disable require-jsdoc, jsdoc/require-jsdoc  */
import { createPreset, Resolve } from '../../di';
import { KnownToken } from '../../tokens';
import { createBaseConfig } from '../../config/base';
import { createConfigSource } from '../../config/browser';
import { Logger, createLogger } from '../../logger';
import { createSentryHandler } from '../../logger/handler/sentry';
import { createSagaMiddleware, SagaExtendedMiddleware } from '../../utils/redux-saga';
import {
  BrowserClient,
  Hub,
  defaultIntegrations,
  defaultStackParser,
  makeFetchTransport,
} from '@sentry/browser';
import { create } from 'middleware-axios';
import type { BaseConfig } from '../../config/types';
import { BridgeClientSide, SsrBridge } from '../../utils/ssr';
import { StrictMap, KnownHttpApiKey } from '../types';
import { HttpApiHostPool, HttpClientLogHandler } from '../utils';
import { loggingMiddleware } from '../../http-client/middleware/logging';
import { HttpClientFactory } from '../../http-client/types';

export function PresetBrowser() {
  return createPreset([
    [KnownToken.Config.source, createConfigSource],
    [KnownToken.Config.base, provideBaseConfig],
    [KnownToken.logger, provideLogger],
    [KnownToken.sagaMiddleware, provideSagaMiddleware],
    [KnownToken.Http.Client.factory, provideHttpClientFactory],
    [KnownToken.Http.Client.LogMiddleware.handler, provideLogMiddlewareHandler],
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
    transport: makeFetchTransport,
    stackParser: defaultStackParser,
    dsn: source.require('PUBLIC_SENTRY_DSN'),
    release: source.require('SENTRY_RELEASE'),
    environment: source.require('PUBLIC_SENTRY_ENVIRONMENT'),
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

export function provideHttpClientFactory(resolve: Resolve): HttpClientFactory {
  const logger = resolve(KnownToken.logger);
  const loggingHandler = resolve(KnownToken.Http.Client.LogMiddleware.handler);

  return function createHttpClient(config) {
    const client = create(config);

    client.use(loggingMiddleware(logger, loggingHandler));

    return client;
  };
}

export function provideLogMiddlewareHandler(): Parameters<typeof loggingMiddleware>[1] {
  return function (data) {
    return new HttpClientLogHandler(data);
  };
}
