import { LogHandler, LogData, DoneLogData, FetchUtil, FailLogData } from '../../../http';
import { isAbortError, isNetworkError } from '../../../http/utils';
import { Breadcrumb, DetailedError, Logger } from '../../../log';
import { Disableable } from './disableable';

/**
 * Обработчик логирования внешних http-запросов.
 */
export class FetchLogging extends Disableable implements LogHandler {
  logger: Logger;

  /** @inheritdoc */
  constructor(logger: Logger) {
    super();
    this.logger = logger;
  }

  /** @inheritdoc */
  onRequest({ request }: LogData) {
    if (this.isDisabled()) {
      return;
    }

    this.logger.info(
      new Breadcrumb({
        category: 'http.request',
        type: 'http',
        data: {
          url: FetchUtil.withoutParams(request.url).href,
          method: request.method,
          params: Object.fromEntries(new URL(request.url).searchParams.entries()),
        },
        level: 'info',
      }),
    );
  }

  /** @inheritdoc */
  onResponse({ response, request }: DoneLogData) {
    if (this.isDisabled()) {
      return;
    }

    this.logger.info(
      new Breadcrumb({
        category: 'http.response',
        type: 'http',
        data: {
          url: FetchUtil.withoutParams(request.url).href,
          method: request.method,
          status_code: response.status,
          params: Object.fromEntries(new URL(request.url).searchParams.entries()),
        },
        level: response.ok ? 'info' : 'error',
      }),
    );

    // по общему соглашению фильтруем все статусы < 500
    if (response.status < 500) {
      return;
    }

    this.logger.error(
      new DetailedError(`HTTP request failed, status code: ${response.status}`, {
        level: 'error',
        context: [
          {
            key: 'Outgoing request details',
            data: {
              url: FetchUtil.withoutParams(request.url).href,
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

  /** @inheritdoc */
  onCatch({ error, request }: FailLogData) {
    if (this.isDisabled()) {
      return;
    }

    // по общему соглашению фильтруем сетевые ошибки
    if (isNetworkError(error)) {
      return;
    }

    // по общему соглашению фильтруем ошибки обрывания
    if (isAbortError(error)) {
      return;
    }

    this.logger.error(
      new DetailedError(String(error), {
        level: 'error',
        context: [
          {
            key: 'Outgoing request details',
            data: {
              url: FetchUtil.withoutParams(request.url).href,
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
