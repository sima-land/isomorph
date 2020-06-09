import { Handlers } from '@sentry/node';

/**
 * @typedef {Object} SentryMiddleware Объект middlewares Sentry.
 * @property {Function} request Middleware, добавляющий данные запроса в scope Sentry.
 * @property {Function} failure Middleware, обрабатывающий ошибки.
 */

/**
 * Конструктор для создания middleware для Sentry.
 * @return {SentryMiddleware} Объект middleware для Sentry.
 */
export const createSentryMiddleware = () => ({
  request: Handlers.requestHandler(),
  failure: Handlers.errorHandler(),
});
