import { FetchUtil, log, type Middleware } from '../../../http';
import { DetailedError, type Logger } from '../../../log';

/**
 * Возвращает новый промежуточный слой для логирования ошибки при обработке входящего http-запроса.
 * @param logger Logger.
 * @return Промежуточный слой.
 */
export function getServeErrorLogging(logger: Logger): Middleware {
  return log({
    onCatch: ({ request, error }) => {
      logger.error(
        new DetailedError(String(error), {
          level: 'error',
          context: [
            {
              key: 'Incoming request details',
              data: {
                url: FetchUtil.withoutParams(request.url),
                method: request.method,
                headers: Object.fromEntries(request.headers.entries()),
                params: Object.fromEntries(new URL(request.url).searchParams.entries()),
                // @todo data
              },
            },
          ],
        }),
      );
    },
  });
}
