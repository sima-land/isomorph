/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { getCurrentScope, getDefaultIntegrations, init } from '@sentry/bun';
import { createSentryHandler } from '../../../log/handler/sentry';

export function provideLogHandlerSentry(resolve: Resolve) {
  const source = resolve(KnownToken.Config.source);

  init({
    dsn: source.require('SENTRY_DSN'),
    release: source.require('SENTRY_RELEASE'),
    environment: source.require('SENTRY_ENVIRONMENT'),
    tracesSampleRate: Number(source.get('SENTRY_TRACES_SAMPLE_RATE', 0)),
    integrations: [...getDefaultIntegrations({})],
  });

  // ВАЖНО: передаем функцию чтобы брать текущий hub в момент вызова метода logger'а
  // это нужно чтобы хлебные крошки в ошибках Sentry группировались по запросам
  return createSentryHandler(getCurrentScope);
}
