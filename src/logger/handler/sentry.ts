import type { SentryLib } from '../../error-tracker/types';
import type { LoggerEventHandler } from '../types';
import { SentryBreadcrumb, SentryError } from '../../error-tracker/utils';

/**
 * Возвращает новый handler для logger'а для отправки событий в Sentry.
 * @param sentry Набор данных для работы с Sentry.
 * @return Handler.
 */
export function createSentryHandler(sentry: SentryLib): LoggerEventHandler {
  return event => {
    // error
    if (event.type === 'error') {
      const error = event.data;

      if (error instanceof SentryError) {
        const { level, context, extra } = error.data;

        sentry.withScope(scope => {
          if (level) {
            scope.setLevel(level);
          }

          if (context) {
            scope.setContext(context.key, context.data);
          }

          if (extra) {
            scope.setExtra(extra.key, extra.data);
          }

          sentry.client.captureException(error);
        });
      } else {
        sentry.client.captureException(error);
      }
    }

    // breadcrumb
    if (event.data instanceof SentryBreadcrumb) {
      const breadcrumb = event.data.data;

      sentry.withScope(scope => {
        scope.addBreadcrumb(breadcrumb);
      });
    }
  };
}
