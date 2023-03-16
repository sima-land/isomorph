import { SeverityLevel } from '@sentry/browser';
import Axios, { AxiosRequestConfig } from 'axios';
import type { Middleware } from 'middleware-axios';
import { ConfigSource } from '../../config/types';
import { SentryBreadcrumb, SentryError } from '../../error-tracking';
import {
  SharedData,
  DoneSharedData,
  FailSharedData,
  LogMiddlewareHandler,
} from '../../http-client/middleware/log';
import { applyAxiosDefaults, displayUrl } from '../../http-client/utils';
import { Logger } from '../../log';
import {
  SagaErrorInfo,
  SagaInterruptInfo,
  SagaMiddlewareHandler,
} from '../../utils/redux-saga/types';
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
 * Возвращает уровень на основе статуса ответа.
 * @param status Статус HTTP-ответа.
 * @return Уровень.
 */
export function severityFromStatus(status: unknown): SeverityLevel {
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

/**
 * Обработчик для промежуточного слоя логирования исходящих http-запросов.
 * Отправляет хлебные крошки и данные ошибки, пригодные для Sentry.
 */
export class HttpClientLogging implements LogMiddlewareHandler {
  protected logger: Logger;

  protected readonly requestInfo: ReturnType<typeof applyAxiosDefaults> & {
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

      // @todo выяснить: нужно ли нам отправлять ответы с кодом <500 в Sentry на уровне всех команд
      // если да то можно добавить метод в духе errorStatusFilter(s => s !== 422)
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

/**
 * Лог событий запуска и выполнения redux-saga.
 */
export class SagaLogging implements SagaMiddlewareHandler {
  protected logger: Logger;

  /**
   * @param logger Logger.
   */
  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * При получении ошибки выполнения саги передаст ее логгеру ее с данными стека в extra.
   * @param error Ошибка.
   * @param info Инфо выполнения саги.
   */
  onSagaError(error: Error, info: SagaErrorInfo) {
    this.logger.error(
      new SentryError(error.message, {
        extra: {
          key: 'Saga stack',
          data: info.sagaStack,
        },
      }),
    );
  }

  /**
   * При получении ошибки запуска саги передаст ее логгеру.
   * @param error Ошибка.
   */
  onConfigError(error: Error) {
    this.logger.error(error);
  }

  /**
   * При прерывании саги передаст информацию логгеру как ошибку.
   * @param info Инфо прерывания саги.
   */
  onTimeoutInterrupt({ timeout }: SagaInterruptInfo) {
    this.logger.error(new Error(`Сага прервана по таймауту (${timeout} миллисекунд)`));
  }
}

/** Работа с HTTP-статусами по соглашению. */
export abstract class HttpStatus {
  /**
   * Определяет, является ли переданный статус успешным.
   * @param status Статус.
   * @return Признак.
   */
  static isOk(status: unknown): boolean {
    return typeof status === 'number' && status === 200;
  }

  /**
   * Определяет, является ли переданный статус успешным POST.
   * @param status Статус.
   * @return Признак.
   */
  static isPostOk(status: unknown): boolean {
    return typeof status === 'number' && status === 201;
  }

  /**
   * Определяет, является ли переданный статус успешным DELETE.
   * @param status Статус.
   * @return Признак.
   */
  static isDeleteOk(status: unknown): boolean {
    return typeof status === 'number' && (status === 204 || status === 200);
  }

  /**
   * Возвращает новый промежуточный слой для валидации статуса HTTP-ответа.
   * Валидация применяется только если в конфиге запроса не указан validateStatus.
   * @return Промежуточный слой.
   */
  static createMiddleware(): Middleware<unknown> {
    return async (config, next, defaults) => {
      if (config.validateStatus !== undefined || defaults.validateStatus !== undefined) {
        // если validateStatus указан явно то не применяем валидацию по умолчанию
        await next(config);
      } else {
        let validateStatus: AxiosRequestConfig['validateStatus'] = null;

        switch (config.method?.toLowerCase()) {
          case 'get':
          case 'put':
          case undefined:
            validateStatus = HttpStatus.isOk;
            break;
          case 'post':
            validateStatus = HttpStatus.isPostOk;
            break;
          case 'delete':
            validateStatus = HttpStatus.isDeleteOk;
            break;
        }

        await next({ ...config, validateStatus });
      }
    };
  }
}