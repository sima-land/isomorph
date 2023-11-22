/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import {
  DoneLogData,
  FailLogData,
  FetchUtil,
  Handler,
  LogData,
  LogHandler,
} from '../../../../http';
import { Breadcrumb, DetailedError, Logger } from '../../../../log';
import { toMilliseconds } from '../../../../utils';

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
  disabled: boolean;

  constructor(logger: Logger) {
    this.logger = logger;
    this.disabled = false;
  }

  onRequest({ request }: LogData) {
    this.logger.info(
      new Breadcrumb({
        category: 'http.request',
        type: 'http',
        data: {
          url: FetchUtil.withoutParams(request.url),
          method: request.method,
          params: Object.fromEntries(new URL(request.url).searchParams.entries()),
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
          params: Object.fromEntries(new URL(request.url).searchParams.entries()),
        },
        level: response.ok ? 'info' : 'error',
      }),
    );
  }

  onCatch({ error, request }: FailLogData) {
    this.logger.error(
      new DetailedError(String(error), {
        level: 'error',
        context: [
          {
            key: 'Outgoing request details',
            data: {
              url: FetchUtil.withoutParams(request.url),
              method: request.method,
              headers: request.headers,
              params: Object.fromEntries(new URL(request.url).searchParams.entries()),
              // @todo data
            },
          },
        ],
      }),
    );
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
    const finish = process.hrtime.bigint();
    const start = this.timeMap.get(request) ?? finish;

    this.logger.info({
      type: 'http.response[outgoing]',
      route: request.url,
      method: request.method,
      status: response.status,
      remote_ip: getClientIp(request),
      latency: toMilliseconds(finish - start),
    });

    // ВАЖНО: обязательно чистим
    this.timeMap.delete(request);
  }

  onCatch({ error, request }: FailLogData) {
    this.logger.error(
      new DetailedError(String(error), {
        level: 'error',
        context: [
          {
            key: 'Incoming request details',
            data: {
              url: FetchUtil.withoutParams(request.url),
              method: request.method,
              headers: request.headers,
              params: Object.fromEntries(new URL(request.url).searchParams.entries()),
              // @todo data
            },
          },
        ],
      }),
    );

    // ВАЖНО: обязательно чистим
    this.timeMap.delete(request);
  }
}