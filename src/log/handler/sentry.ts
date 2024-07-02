import type { LogHandler } from '../types';
import type { Scope } from '@sentry/types';
import { Breadcrumb, DetailedError } from '../../log';

/**
 * Возвращает новый handler для logger'а для отправки событий в Sentry.
 * @param scopeInit Sentry Hub или функция которая его вернёт.
 * @return Handler.
 */
export function createSentryHandler(scopeInit: Scope | (() => Scope)): LogHandler {
  const getScope = typeof scopeInit === 'function' ? scopeInit : () => scopeInit;

  return event => {
    // ВАЖНО: каждый входящий http-запрос должен иметь свой собственный hub (ныне scope)
    // подробности: https://github.com/getsentry/sentry-javascript/discussions/5648
    // поэтому если передана функция - вызываем каждый раз (внутри обработчика)
    const scope = getScope();

    // error
    if (event.type === 'error') {
      const error = event.data;

      if (error instanceof DetailedError) {
        const { level, context, extra } = error.data;

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
      }

      scope.captureException(error);
    }

    // breadcrumb
    if (event.data instanceof Breadcrumb) {
      const breadcrumb = event.data.data;

      scope.addBreadcrumb(breadcrumb);
    }
  };
}
