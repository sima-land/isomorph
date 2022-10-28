import Axios from 'axios';
import { ConfigSource } from '../../config/types';
import { SentryBreadcrumb, SentryError } from '../../error-tracking';
import {
  DoneSharedData,
  FailSharedData,
  LogMiddlewareHandler,
  severityFromStatus,
  SharedData,
} from '../../http-client/middleware/logging';
import { applyAxiosDefaults, displayUrl } from '../../http-client/utils';
import { Logger } from '../../logger';
import { StrictMap } from './types';

/** Реализация пула хостов. */
export class HttpApiHostPool<Key extends string> implements StrictMap<Key> {
  private map: Record<Key, string>;
  private source: ConfigSource;

  /**
   * Конструктор.
   * @param map Карта "Название api >> Название переменной среды с хостом api".
   * @param source Источник конфигурации.
   */
  constructor(map: Record<Key, string>, source: ConfigSource) {
    this.map = map;
    this.source = source;
  }

  /** @inheritDoc */
  get(key: Key): string {
    const variableName = this.map[key];

    if (!variableName) {
      throw Error(`Known HTTP API not found by key "${key}"`);
    }

    // "лениво" берём переменную, именно в момент вызова (чтобы не заставлять указывать в сервисах все переменные разом)
    return this.source.require(variableName);
  }
}

/**
 * Обработчик для промежуточного слоя логирования исходящих http-запросов.
 * Отправляет хлебные крошки и данные ошибки, пригодные для Sentry.
 */
export class HttpClientLogHandler implements LogMiddlewareHandler {
  private logger: Logger;

  private readonly requestInfo: ReturnType<typeof applyAxiosDefaults> & {
    readyURL: string;
  };

  /**
   * Конструктор.
   * @param logger Logger.
   * @param data Данные запроса.
   */
  constructor(logger: Logger, data: SharedData) {
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
    const { readyURL, method, params } = this.requestInfo;

    this.logger.info(
      new SentryBreadcrumb({
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
    const { readyURL, method, params } = this.requestInfo;

    this.logger.info(
      new SentryBreadcrumb({
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
    if (Axios.isAxiosError(error)) {
      const { requestInfo } = this;
      const statusCode = error.response?.status || 'UNKNOWN';

      this.logger.error(
        new SentryError(
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
          new SentryBreadcrumb({
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
