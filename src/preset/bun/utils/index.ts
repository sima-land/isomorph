/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { DoneLogData, FailLogData, Handler, LogData, LogHandler, StatusError } from '../../../http';
import { Breadcrumb, DetailedError, Logger } from '../../../log';
import { severityFromStatus } from '../../../preset/isomorphic/utils';
import { toMilliseconds } from '../../../utils';

/**
 * Утилиты для работы с Request, Response, URL, Headers, URLSearchParams.
 */
export const FetchUtil = {
  getParams(url: string | URL) {
    return Object.fromEntries(new URL(url).searchParams.entries());
  },

  setParams(url: URL, params: Record<string, string | number | undefined | null>): void {
    for (const [paramName, paramValue] of Object.entries(params)) {
      if (paramValue !== null && paramValue !== undefined) {
        url.searchParams.set(paramName, String(paramValue));
      }
    }
  },

  withoutParams(url: string | URL): URL {
    const result = new URL(url);

    result.search = '';

    return result;
  },
} as const;

export function healthCheck(): Handler {
  const startTime = Date.now();

  return () =>
    new Response(JSON.stringify({ uptime: Date.now() - startTime }), {
      headers: {
        'content-type': 'application/json',
      },
    });
}

export function getClientIp(request: Request): string | null {
  const headerValue = request.headers.get('x-client-ip') || request.headers.get('x-forwarded-for');

  return headerValue;
}

/**
 * Обработчик логирования внешних http-запросов.
 */
export class FetchLogging implements LogHandler {
  logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  onRequest({ request }: LogData) {
    this.logger.info(
      new Breadcrumb({
        category: 'http.request',
        type: 'http',
        data: {
          url: FetchUtil.withoutParams(request.url),
          method: request.method,
          params: FetchUtil.getParams(request.url),
        },
        level: 'info',
      }),
    );
  }

  onResponse({ response, request }: DoneLogData) {
    this.logger.info(
      new Breadcrumb({
        category: 'http.response',
        type: 'http',
        data: {
          url: FetchUtil.withoutParams(request.url),
          method: request.method,
          status_code: response.status,
          params: FetchUtil.getParams(request.url),
        },
        level: 'info',
      }),
    );
  }

  onCatch({ error, request }: FailLogData) {
    if (error instanceof StatusError) {
      const statusCode = error.response.status;

      this.logger.error(
        new DetailedError(
          `HTTP request failed, status code: ${statusCode}, error message: ${error.message}`,
          {
            level: severityFromStatus(error.response?.status),
            context: [
              {
                key: 'Request details',
                data: {
                  url: FetchUtil.withoutParams(request.url),
                  method: request.method,
                  headers: request.headers,
                  params: FetchUtil.getParams(request.url),
                  // @todo data
                },
              },
              {
                key: 'Response details',
                data: {
                  // копируем так как в Sentry падает ошибка: **non-serializable** (TypeError: Object.getPrototypeOf(...) is null)
                  headers: {
                    ...error.response?.headers,
                    cookie: undefined,
                    Cookie: undefined,
                  },

                  // @todo data, error
                },
              },
            ],
          },
        ),
      );

      this.logger.info(
        new Breadcrumb({
          category: 'http.response',
          type: 'http',
          data: {
            url: FetchUtil.withoutParams(request.url),
            method: request.method,
            status_code: statusCode,
            params: FetchUtil.getParams(request.url),
          },
          level: 'error',
        }),
      );
    } else {
      this.logger.error(error);
    }
  }
}

/**
 * Логирование обработки входящих http-запросов.
 */
export class ServeLogging implements LogHandler {
  logger: Logger;
  timeMap: Map<Request, bigint>;

  constructor(logger: Logger) {
    this.logger = logger;
    this.timeMap = new Map();
  }

  onRequest({ request }: LogData) {
    this.timeMap.set(request, process.hrtime.bigint());

    this.logger.info({
      type: 'http.request[incoming]',
      route: request.url,
      method: request.method,
      remote_ip: getClientIp(request),
    });
  }

  onResponse({ response, request }: DoneLogData) {
    const start = this.timeMap.get(request) ?? 0n;
    const finish = process.hrtime.bigint();

    this.logger.info({
      type: 'http.response[outgoing]',
      route: request.url,
      method: request.method,
      status: response.status,
      remote_ip: getClientIp(request),
      latency: toMilliseconds(finish - start),
    });
  }

  onCatch({ error }: FailLogData) {
    this.logger.error(error);
  }
}
