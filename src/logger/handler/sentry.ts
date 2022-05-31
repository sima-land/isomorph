import type { LoggerEventHandler } from '../types';
import type { Hub } from '@sentry/types';
import { SentryBreadcrumb, SentryError } from '../../error-tracker/utils';

/**
 * Возвращает новый handler для logger'а для отправки событий в Sentry.
 * @param hub Набор данных для работы с Sentry.
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
            scope.setContext(context.key, context.data);
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

      hub.withScope(scope => {
        scope.addBreadcrumb(breadcrumb);
      });
    }
  };
}
