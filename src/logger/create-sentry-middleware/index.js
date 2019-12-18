import { Handlers } from '@sentry/node';

/**
 * Конструктор для создания middleware для Sentry.
 * @return {Function} Middleware для Sentry.
 */
export default Handlers.errorHandler;
