import type { SentryLib } from '../../error-tracker/types';
import type { LoggerEventHandler } from '../types';

export function createSentryHandler(sentry: SentryLib): LoggerEventHandler {
  return event => {
    if (event.type === 'error') {
      sentry.client.captureException(event.data);
    }
  };
}
