/**
 * Сервис для логирования ошибок в Sentry.
 * @param {Object} [options] Опции.
 * @param {Object} [options.sentryLoggerService] Сервис Sentry.
 * @return {Object} Сервис.
 */
export default function sentryLogger ({ sentryLoggerService } = {}) {
  return {
    captureException: (...args) => sentryLoggerService.captureException(...args),
    captureMessage: (...args) => sentryLoggerService.captureMessage(...args),
    captureBreadcrumb: (...args) => sentryLoggerService.addBreadcrumb(...args),

    /**
     * Метод перехвата ошибки с дополнительными данными об ошибке.
     * @param {Error} error Ошибка.
     * @param {*} extendedData Дополнительные данные.
     * @param {string} dataName Наименование дополнительных данных.
     */
    captureExtendedException: (error, extendedData, dataName = 'details') => {
      sentryLoggerService.withScope(scope => {
        scope.setExtra(dataName, extendedData);
        sentryLoggerService.captureException(error);
      });
    },
  };
}
