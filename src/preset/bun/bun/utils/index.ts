/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { DoneLogData, FailLogData, FetchUtil, LogData, LogHandler } from '../../../../http';
import { DetailedError, Logger } from '../../../../log';
import { toMilliseconds } from '../../../../utils';

export function getClientIp(request: Request): string | null {
  const headerValue = request.headers.get('x-client-ip') || request.headers.get('x-forwarded-for');

  return headerValue;
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
