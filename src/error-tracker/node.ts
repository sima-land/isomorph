import type { SentryLib } from './types';
import * as Sentry from '@sentry/node';

/**
 * Возвращает новый набор из клиента Sentry и функций из пакета Sentry.
 * @param options Опции создания клиента.
 * @return Новый набор из клиента Sentry и функций из пакета Sentry.
 */
export function createSentryLib(options: Sentry.NodeOptions): SentryLib {
  return {
    client: new Sentry.NodeClient(options),
    withScope: Sentry.withScope,
  };
}
