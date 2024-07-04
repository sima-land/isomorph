import { init, getDefaultIntegrations, getCurrentScope } from '@sentry/node';
import { Resolve } from '../../../di';
import { LogHandler } from '../../../log';
import { createSentryHandler } from '../../../log/handler/sentry';
import { KnownToken } from '../../../tokens';

/**
 * Провайдер обработчика логирования для Sentry.
 * @param resolve Функция для получения зависимости по токену.
 * @return Обработчик.
 */
export function provideLogHandlerSentry(resolve: Resolve): LogHandler {
  const source = resolve(KnownToken.Config.source);

  // экспериментально пробуем не использовать вручную созданный клиент
  init({
    dsn: source.require('SENTRY_DSN'),
    release: source.require('SENTRY_RELEASE'),
    environment: source.require('SENTRY_ENVIRONMENT'),
    tracesSampleRate: Number(source.get('SENTRY_TRACES_SAMPLE_RATE', 0)),
    profilesSampleRate: Number(source.get('SENTRY_TRACES_SAMPLE_RATE', 0)),
    integrations: [...getDefaultIntegrations({})],

    // ВАЖНО: данная опция ломает группировку ошибок, активировать при необэодимости связать компоненты OTEL с Sentry
    // skipOpenTelemetrySetup: true,
  });

  // ВАЖНО: передаем функцию чтобы брать текущий scope в момент вызова метода logger'а
  // это нужно чтобы хлебные крошки в ошибках Sentry группировались по запросам
  return createSentryHandler(getCurrentScope);
}
