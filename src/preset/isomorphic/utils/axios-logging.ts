import { Breadcrumb, DetailedError, type Logger } from '../../../log';
import {
  type LogMiddlewareHandler,
  applyAxiosDefaults,
  SharedData,
  DoneSharedData,
  FailSharedData,
} from '../../../utils/axios';
import { Disableable } from './disableable';
import { displayUrl } from './display-url';
import { severityFromStatus } from './severity-from-status';
import axios from 'axios';

/**
 * Обработчик для промежуточного слоя логирования исходящих http-запросов.
 * Отправляет хлебные крошки и данные ошибки, пригодные для Sentry.
 */
export class AxiosLogging extends Disableable implements LogMiddlewareHandler {
  logger: Logger;

  protected readonly requestInfo: ReturnType<typeof applyAxiosDefaults> & {
    readyURL: string;
  };

  /**
   * Конструктор.
   * @param logger Logger.
   * @param data Данные запроса.
   */
  constructor(logger: Logger, data: SharedData) {
    super();
    const config = applyAxiosDefaults(data.config, data.defaults);

    this.logger = logger;

    this.requestInfo = {
      ...config,
      readyURL: displayUrl(config.baseURL, config.url),
    };
  }

  /**
   * Отправит хлебные крошки перед запросом.
   */
  beforeRequest() {
    if (this.isDisabled()) {
      return;
    }

    const { readyURL, method, params } = this.requestInfo;

    this.logger.info(
      new Breadcrumb({
        category: 'http.request',
        type: 'http',
        data: {
          url: readyURL,
          method,
          params,
        },
        level: 'info',
      }),
    );
  }

  /**
   * Отправит хлебные крошки после запроса.
   * @param data Данные ответа.
   */
  afterResponse({ response }: DoneSharedData) {
    if (this.isDisabled()) {
      return;
    }

    const { readyURL, method, params } = this.requestInfo;

    this.logger.info(
      new Breadcrumb({
        category: 'http.response',
        type: 'http',
        data: {
          url: readyURL,
          method,
          status_code: response.status,
          params,
        },
        level: 'info',
      }),
    );
  }

  /**
   * Отправит данные ошибки при перехвате.
   * @param data Данные запроса.
   */
  onCatch({ error }: FailSharedData) {
    if (this.isDisabled()) {
      return;
    }

    if (axios.isAxiosError(error)) {
      const { requestInfo } = this;
      const statusCode = error.response?.status || 'UNKNOWN';

      // @todo выяснить: нужно ли нам отправлять ответы с кодом <500 в Sentry на уровне всех команд
      // если да то можно добавить метод в духе errorStatusFilter(s => s !== 422)
      this.logger.error(
        new DetailedError(
          `HTTP request failed, status code: ${statusCode}, error message: ${error.message}`,
          {
            level: severityFromStatus(error.response?.status),
            context: [
              {
                key: 'Request details',
                data: {
                  url: requestInfo.url,
                  baseURL: requestInfo.baseURL,
                  method: requestInfo.method,
                  headers: requestInfo.headers,
                  data: requestInfo.data,
                  params: requestInfo.params,
                },
              },
              {
                key: 'Response details',
                data: {
                  data: error.response?.data,

                  // копируем так как в Sentry падает ошибка: **non-serializable** (TypeError: Object.getPrototypeOf(...) is null)
                  headers: { ...error.response?.headers },

                  error: error.toJSON(),
                },
              },
            ],
          },
        ),
      );

      if (typeof statusCode === 'number') {
        this.logger.info(
          new Breadcrumb({
            category: 'http.response',
            type: 'http',
            data: {
              url: requestInfo.readyURL,
              method: requestInfo.method,
              status_code: statusCode,
              params: requestInfo.params,
            },
            level: 'error',
          }),
        );
      }
    } else {
      this.logger.error(error);
    }
  }
}
