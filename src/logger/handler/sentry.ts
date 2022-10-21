import type { LoggerEventHandler } from '../types';
import type { Hub } from '@sentry/types';
import { SentryBreadcrumb, SentryError } from '../../error-tracking';

/**
 * Возвращает новый handler для logger'а для отправки событий в Sentry.
 * @param hub Sentry Hub.
 * @return Handler.
 */
export function createSentryHandler(hub: Hub): LoggerEventHandler {
  return event => {
    // error
    if (event.type === 'error') {
      const error = event.data;

      if (error instanceof SentryError) {
        const { level, context, extra } = error.data;

        hub.withScope(scope => {
          if (level) {
            scope.setLevel(level);
          }

          if (context) {
            const list = Array.isArray(context) ? context : [context];

            for (const item of list) {
              scope.setContext(item.key, item.data);
            }
          }

          if (extra) {
            scope.setExtra(extra.key, extra.data);
          }

          hub.captureException(error);
        });
      } else {
        hub.captureException(error);
      }
    }

    // breadcrumb
    if (event.data instanceof SentryBreadcrumb) {
      const breadcrumb = event.data.data;

      hub.addBreadcrumb(breadcrumb);
    }
  };
}
