import Raven from 'raven';

/**
 * Конструктор для создания middleware для Sentry.
 * @return {Function} Middleware для Sentry.
 */
export default Raven.errorHandler;
