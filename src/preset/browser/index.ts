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

export function PresetBrowser() {
  return createPreset([
    [KnownToken.Config.source, createConfigSource],
    [KnownToken.Config.base, provideBaseConfig],
    [KnownToken.logger, provideLogger],
    [KnownToken.sagaMiddleware, provideSagaMiddleware],
    [KnownToken.Http.Client.factory, () => create],
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
