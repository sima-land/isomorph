import { ErrorDetails, BreadcrumbDetails } from './types';

/**
 * Ошибка с данными.
 */
export class DetailedError extends Error {
  data: ErrorDetails;

  /**
   * @param message Сообщение.
   * @param data Данные.
   */
  constructor(message?: string, data: ErrorDetails = {}) {
    super(message);
    this.data = data;
  }
}

/**
 * Хлебная крошка.
 */
export class Breadcrumb {
  type: string;
  data: BreadcrumbDetails;

  /**
   * @param data Данные.
   */
  constructor(data: BreadcrumbDetails) {
    this.type = 'breadcrumb';
    this.data = data;
  }
}
