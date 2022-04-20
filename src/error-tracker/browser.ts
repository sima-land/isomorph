import type { SentryLib } from './types';
import * as Sentry from '@sentry/browser';

/**
 * Возвращает новый набор из клиента Sentry и функций из пакета Sentry.
 * @param options Опции создания клиента.
 * @return Новый набор из клиента Sentry и функций из пакета Sentry.
 */
export function createSentryLib(options: Sentry.BrowserOptions): SentryLib {
  return {
    client: new Sentry.BrowserClient(options),
    withScope: Sentry.withScope,
  };
}
