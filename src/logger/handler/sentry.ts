import type { SentryLib } from '../../error-tracker/types';
import type { LoggerEventHandler } from '../types';

/**
 * Возвращает новый handler для logger'а для отправки событий в Sentry.
 * @param sentry Набор данных для работы с Sentry.
 * @return Handler.
 */
export function createSentryHandler(sentry: SentryLib): LoggerEventHandler {
  return event => {
    if (event.type === 'error') {
      sentry.client.captureException(event.data);
    }
  };
}
