import Axios from 'axios';
import { Middleware } from 'middleware-axios';
import { Logger } from '../../logger/types';
import { SentryBreadcrumb, SentryError } from '../../error-tracker/utils';
import { Severity } from '@sentry/types';

/**
 * Возвращает новый middleware для логирования запросов.
 * @param logger Логгер.
 * @return Middleware.
 */
export function loggingMiddleware(logger: Logger): Middleware<any> {
  return async function (config, next, defaults) {
    const { baseURL, url, method = 'get', params, data } = { ...defaults, ...config };
    const readyMethod = method.toUpperCase();
    const readyURL = baseURL ? `${baseURL.replace(/\/$/, '')}/${url}` : url;

    try {
      logger.info(
        new SentryBreadcrumb({
          category: 'http.request',
          type: 'http',
          data: {
            url: readyURL,
            method: readyMethod,
            params,
          },
          level: Severity.Info,
        }),
      );

      const response = await next(config);

      logger.info(
        new SentryBreadcrumb({
          category: 'http.response',
          type: 'http',
          data: {
            url: readyURL,
            status_code: response.status,
            method: readyMethod,
            params,
          },
          level: Severity.Info,
        }),
      );
    } catch (error) {
      if (Axios.isAxiosError(error)) {
        const statusCode = error.response?.status || 'UNKNOWN';

        logger.error(
          new SentryError(`HTTP request failed with status code ${statusCode}`, {
            level: severityFromStatus(error.response?.status),
            context: {
              key: 'Request details',
              data: {
                url,
                baseURL,
                method: readyMethod,
                headers: {
                  ...config.headers,
                  ...defaults.headers[readyMethod.toLowerCase() as keyof typeof defaults.headers],
                },
                params,
                data,
              },
            },
          }),
        );

        logger.info(
          new SentryBreadcrumb({
            category: 'http.response',
            type: 'http',
            data: {
              url: readyURL,
              status_code: statusCode,
              method: readyMethod,
              params,
            },
            level: Severity.Error,
          }),
        );
      }

      // ВАЖНО: не скрываем ошибку, сообщаем остальному миру про нее
      throw error;
    }
  };
}

/**
 * Возвращает уровень на основе статуса ответа.
 * @param status Статус.
 * @return Уровень.
 */
export function severityFromStatus(status: number | undefined) {
  return typeof status === 'number' && status >= 200 && status < 300
    ? Severity.Info
    : Severity.Error;
}
