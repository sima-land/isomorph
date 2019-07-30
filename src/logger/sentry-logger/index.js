/**
 * Сервис для логгирования ошибок в Sentry.
 * @param {Object} [options] Опции.
 * @param {Object} [options.sentryLoggerService] Сервис Sentry.
 * @return {Object} Сервис.
 */
export default function sentryLogger ({ sentryLoggerService } = {}) {
  return {
    captureException: (...args) => sentryLoggerService.captureException(...args),
    captureMessage: (...args) => sentryLoggerService.captureMessage(...args),
    captureBreadcrumb: (...args) => sentryLoggerService.captureBreadcrumb(...args),
  };
}
