import { SentryErrorData, SentryBreadcrumbData } from './types';

/**
 * Ошибка с данными для Sentry.
 * @todo Этот класс должен называться либо SentryReadyError либо в названии вообще не должен фигурировать Sentry.
 */
export class SentryError extends Error {
  data: SentryErrorData;

  /**
   * @param message Сообщение.
   * @param data Данные.
   */
  constructor(message: string, data: SentryErrorData = {}) {
    super(message);
    this.data = data;
  }
}

/**
 * Хлебная крошка для Sentry.
 * @todo Этот класс должен называться либо SentryReadyBreadcrumb либо в названии вообще не должен фигурировать Sentry.
 */
export class SentryBreadcrumb {
  data: SentryBreadcrumbData;

  /**
   * @param data Данные.
   */
  constructor(data: SentryBreadcrumbData) {
    this.data = data;
  }
}
