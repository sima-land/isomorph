/* eslint-disable require-jsdoc, jsdoc/require-jsdoc  */
import { createPreset, Resolve } from '../../di';
import { KnownToken } from '../../tokens';
import { createBaseConfig } from '../../config/base';
import { createConfigSource } from '../../config/browser';
import { createSentryLib } from '../../error-tracker/browser';
import { createLogger } from '../../logger';
import { createSentryHandler } from '../../logger/handler/sentry';
import { createSagaRunner } from '../../saga-runner';
import { defaultIntegrations } from '@sentry/browser';
import type { SagaRunner } from '../../saga-runner/types';
import type { Logger } from '../../logger/types';
import type { BaseConfig } from '../../config/types';

export function PresetBrowser() {
  return createPreset([
    [KnownToken.Config.source, createConfigSource],
    [KnownToken.Config.base, provideBaseConfig],
    [KnownToken.logger, provideLogger],
    [KnownToken.sagaRunner, provideSagaRunner],
  ]);
}

function provideBaseConfig(resolve: Resolve): BaseConfig {
  const source = resolve(KnownToken.Config.source);

  return createBaseConfig(source);
}

function provideLogger(resolve: Resolve): Logger {
  const source = resolve(KnownToken.Config.source);

  // @todo брать клиент и библиотеку из di-контейнера
  const sentry = createSentryLib({
    dsn: source.get('SENTRY_CLIENT_DSN'),
    release: source.get('SENTRY_RELEASE'),
    environment: source.get('SENTRY_ENVIRONMENT'),
    integrations: defaultIntegrations,
  });

  const logger = createLogger();

  logger.subscribe(createSentryHandler(sentry));

  return logger;
}

function provideSagaRunner(resolve: Resolve): SagaRunner {
  const logger = resolve(KnownToken.logger);

  return createSagaRunner(logger);
}
