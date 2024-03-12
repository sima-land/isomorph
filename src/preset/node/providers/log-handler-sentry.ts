import * as Sentry from '@sentry/node';
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
  Sentry.init({
    dsn: source.require('SENTRY_DSN'),
    release: source.require('SENTRY_RELEASE'),
    environment: source.require('SENTRY_ENVIRONMENT'),
  });

  // ВАЖНО: передаем функцию чтобы брать текущий hub в момент вызова метода logger'а
  // это нужно чтобы хлебные крошки в ошибках Sentry группировались по запросам
  return createSentryHandler(Sentry.getCurrentHub);
}
