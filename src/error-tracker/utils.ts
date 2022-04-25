import { SentryErrorData } from './types';

/**
 * Ошибка с данными для Sentry.
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
    this.name = 'SentryError';
  }
}
