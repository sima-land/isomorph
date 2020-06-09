import isFunction from 'lodash/isFunction';

/**
 * Выполняет конфигурацию переданного сервиса Sentry.
 * @param {Object} options Опции.
 * @param {Object} options.sentryLoggerService Сервис Sentry.
 * @param {Function} options.getSentryDsn Функция, возвращающая DSN Sentry.
 * @param {Function} [options.getSentryOptions] Функция, возвращающая объект опций Sentry.
 * @param {Function} [options.configureMainScope] Функция конфигурации основной области действия
 * экземпляра/глобального экземпляра Sentry.
 * @return {Function} Функция, возвращающая сконфигурированный сервис Sentry.
 */
const initializeSentryCreator = (
  {
    sentryLoggerService,
    getSentryDsn,
    getSentryOptions,
    configureMainScope,
  }
) => () => {
  if (!isFunction(getSentryDsn)) {
    throw new TypeError('"getSentryDsn" must be a function');
  }
  if (getSentryOptions && !isFunction(getSentryOptions)) {
    throw new TypeError('"getSentryOptions" must be a function');
  }
  if (configureMainScope && !isFunction(configureMainScope)) {
    throw new TypeError('"configureMainScope" must be a function');
  }

  const sentryDSN = getSentryDsn() || '';
  const sentryOptions = (getSentryOptions && getSentryOptions()) || {};
  sentryLoggerService.init({
    dsn: sentryDSN,
    ...sentryOptions,
  });

  if (isFunction(sentryLoggerService.configureScope) && isFunction(configureMainScope)) {
    sentryLoggerService.configureScope(configureMainScope);
  }
};

export default initializeSentryCreator;
