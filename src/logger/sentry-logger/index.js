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
     * @param {Object} [options] Опции.
     * @param {string} [options.dataName] = 'details' Наименование дополнительных данных.
     * @param {boolean} [options.dataAsContext] = false Прикрепить ли дополнительные данные как контекст ошибки.
     * @param {string} [options.level] Уровень логирования.
     */
    captureExtendedException: (error, extendedData, options) => {
      const { dataName = 'details', dataAsContext = false, level } = options || {};
      sentryLoggerService.withScope(scope => {
        dataAsContext
          ? scope.setContext(dataName, extendedData)
          : scope.setExtra(dataName, extendedData);
        level && scope.setLevel(level);
        sentryLoggerService.captureException(error);
      });
    },
  };
}
