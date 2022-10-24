import Axios from 'axios';
import { ConfigSource } from '../config/types';
import { SentryBreadcrumb, SentryError } from '../error-tracking';
import {
  DoneSharedData,
  FailSharedData,
  LoggingMiddlewareHandler,
  severityFromStatus,
  SharedData,
} from '../http-client/middleware/logging';
import { applyAxiosDefaults, displayUrl } from '../http-client/utils';
import { StrictMap } from './types';

/** Реализация пула хостов. */
export class HttpApiHostPool<Key extends string> implements StrictMap<Key> {
  private map: Record<Key, string>;
  private source: ConfigSource;

  /**
   * Конструктор.
   * @param map Карта значений по их ключам.
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
export class HttpClientLogHandler implements LoggingMiddlewareHandler {
  private readonly requestInfo: ReturnType<typeof applyAxiosDefaults> & {
    readyURL: string;
  };

  /**
   * Получив данные логирования вернет новый обработчик.
   * @param data Начальные данны логирования.
   * @return Обработчик.
   */
  static create(data: SharedData): HttpClientLogHandler {
    return new HttpClientLogHandler(data);
  }

  /**
   * Конструктор.
   * @param data Данные запроса.
   */
  constructor(data: SharedData) {
    const config = applyAxiosDefaults(data.config, data.defaults);

    this.requestInfo = {
      ...config,
      readyURL: displayUrl(config.baseURL, config.url),
    };
  }

  /**
   * Отправит хлебные крошки перед запросом.
   * @param data Данные запроса.
   */
  beforeRequest({ logger }: SharedData) {
    const { readyURL, method, params } = this.requestInfo;

    logger.info(
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
  afterResponse({ logger, response }: DoneSharedData) {
    const { readyURL, method, params } = this.requestInfo;

    logger.info(
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
  onCatch({ logger, error }: FailSharedData) {
    if (Axios.isAxiosError(error)) {
      const { requestInfo } = this;
      const statusCode = error.response?.status || 'UNKNOWN';

      logger.error(
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
                  headers: error.response?.headers,
                  error: error.toJSON(),
                },
              },
            ],
          },
        ),
      );

      if (typeof statusCode === 'number') {
        logger.info(
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
      logger.error(error);
    }
  }
}
