import isFunction from 'lodash/isFunction';

/**
 * Выполняет конфигурацию переданного сервиса Sentry.
 * @param {Object} options Опции.
 * @param {Object} options.sentryLoggerService Сервис Sentry.
 * @param {Function} options.getSentryDsn Функция, возвращающая DSN Sentry.
 * @param {Function} [options.getSentryOptions] Функция, возвращающая объект опций Sentry.
 * @return {Function} Функция, возвращающая сконфигурированный сервис Sentry.
 */
const initializeSentryCreator = (
  {
    sentryLoggerService,
    getSentryDsn,
    getSentryOptions,
  }
) => () => {
  if (!isFunction(getSentryDsn)) {
    throw new TypeError('"getSentryDsn" must be a function');
  }
  if (getSentryOptions && !isFunction(getSentryOptions)) {
    throw new TypeError('"getSentryOptions" must be a function');
  }
  const sentryDSN = getSentryDsn() || '';
  const sentryOptions = (getSentryOptions && getSentryOptions()) || {};
  sentryLoggerService.config(
    sentryDSN,
    sentryOptions,
  ).install();
};

export default initializeSentryCreator;
