import Raven from 'raven';

/**
 * Сервис для логгирования ошибок в Sentry.
 * @param {Object} [options] Опции.
 * @param {Object} [options.sentryLoggerService=Raven] Сервис Sentry.
 * @return {Object} Сервис.
 */
export default function sentryLogger ({ sentryLoggerService = Raven } = {}) {
  return {
    captureException: (...args) => sentryLoggerService.captureException(...args),
    captureMessage: (...args) => sentryLoggerService.captureMessage(...args),
    captureBreadcrumb: (...args) => sentryLoggerService.captureBreadcrumb(...args),
  };
}
