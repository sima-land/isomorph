import Axios from 'axios';
import { Middleware } from 'middleware-axios';
import { Logger } from '../../logger/types';
import { SentryBreadcrumb, SentryError } from '../../error-tracking';
import { SeverityLevel } from '@sentry/types';

/**
 * Возвращает новый middleware для логирования запросов.
 * @param logger Логгер.
 * @return Middleware.
 */
export function loggingMiddleware(logger: Logger): Middleware<any> {
  return async function log(config, next, defaults) {
    const { baseURL, url, method = 'get', params, data } = { ...defaults, ...config };
    const readyMethod = method.toUpperCase();

    const readyURL = baseURL
      ? `${baseURL.replace(/\/$/, '')}/${(url || '').replace(/^\//, '')}`
      : url;

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
          level: 'info',
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
          level: 'info',
        }),
      );
    } catch (error) {
      if (Axios.isAxiosError(error)) {
        const statusCode = error.response?.status || 'UNKNOWN';

        logger.error(
          new SentryError(`HTTP request failed with status code ${statusCode}`, {
            // @todo в будущем дать возможность конфигурировать
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
            level: 'error',
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
 * @todo Возможно стоит вынести в preset.
 * @param status Статус.
 * @return Уровень.
 */
export function severityFromStatus(status: number | undefined): SeverityLevel {
  let result: SeverityLevel;

  if (typeof status === 'number') {
    switch (true) {
      case status >= 200 && status <= 299:
        result = 'info';
        break;
      case status >= 300 && status <= 499:
        result = 'warning';
        break;
      default:
        result = 'error';
    }
  } else {
    result = 'error';
  }

  return result;
}
