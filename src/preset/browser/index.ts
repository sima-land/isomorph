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
import { StrictMap, KnownHttpApiKey } from '../parts/types';
import { HttpApiHostPool, HttpStatus } from '../parts/utils';
import { logMiddleware } from '../../http-client/middleware/log';
import { HttpClientFactory } from '../../http-client/types';
import {
  provideBaseConfig,
  provideSagaMiddleware,
  provideHttpClientLogHandler,
} from '../parts/providers';

export function PresetBrowser(): Preset {
  return createPreset([
    [KnownToken.Config.source, provideConfigSource],
    [KnownToken.Config.base, provideBaseConfig],
    [KnownToken.logger, provideLogger],
    [KnownToken.sagaMiddleware, provideSagaMiddleware],
    [KnownToken.Http.Client.factory, provideHttpClientFactory],
    [KnownToken.Http.Client.Middleware.Log.handler, provideHttpClientLogHandler],
    [KnownToken.SsrBridge.clientSide, provideBridgeClientSide],
    [KnownToken.Http.Api.knownHosts, provideKnownHttpApiHosts],
  ]);
}

export function provideConfigSource(): ConfigSource {
  return createConfigSource({
    environment: process.env,
  });
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

export function provideHttpClientFactory(resolve: Resolve): HttpClientFactory {
  const logHandler = resolve(KnownToken.Http.Client.Middleware.Log.handler);

  return function createHttpClient(config = {}) {
    const client = create(config);

    client.use(HttpStatus.createMiddleware());
    client.use(logMiddleware(logHandler));

    return client;
  };
}
