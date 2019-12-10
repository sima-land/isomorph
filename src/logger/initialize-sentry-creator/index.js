/**
 * Выполняет конфигурацию переданного сервиса Sentry.
 * @param {Object} options Опции.
 * @param {Object} options.sentryLoggerService Сервис Sentry.
 * @param {string} options.config.sentryDsnServer DSN Sentry.
 * @param {Object} options.config.sentryOptions Прочие опции конфигурации.
 * @return {Function} Функция, возвращающая сконфигурированный сервис Sentry.
 */
const initializeSentryCreator = (
  {
    sentryLoggerService,
    config: {
      sentryDsnServer,
      sentryOptions,
    },
  }
) => () =>
  sentryLoggerService.config(
    sentryDsnServer,
    {
      ...sentryOptions,
    }
  ).install();

export default initializeSentryCreator;
