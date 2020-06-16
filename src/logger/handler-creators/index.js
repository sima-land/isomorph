/**
 * Возвращает обработчик ошибки, передающий ошибку Sentry.
 * @param {Function} captureExtendedException Метод захвата ошибки Sentry.
 * @return {Function} Обработчик ошибки.
 */
export const createSentryHandlerForSagas = ({ sentry: { captureExtendedException } }) =>

  /**
   * Обработчик ошибки, передающий ошибку методу Sentry.
   * @param {Error} error Объект ошибки.
   * @param {string} sagaStack Стек вызовов саг.
   */
  (error, { sagaStack }) => captureExtendedException(error, sagaStack, { dataName: 'Sagas stack' });

/**
 * Возвращает обработчик ошибки, передающий ошибку Sentry.
 * @param {Function} captureException Метод захвата ошибки Sentry.
 * @return {Function} Обработчик ошибки.
 */
export const createSentryHandlerForStore = ({ sentry: { captureException } }) =>
  () => captureException(new Error('Ожидание готовности store было прервано по таймауту'));

/**
 * Возвращает функцию для базовой конфигурации области действия экземпляра Sentry.
 * @param {Object} options Опции сервиса.
 * @param {Object} options.config Конфигурация приложения.
 * @return {Function} Функция, конфигурирующая область действия.
 */
export const createDefaultScopeConfigurator = ({ config }) => scope => {
  /**
   * Добавляем к области действия контекст с текущей конфигурацией приложения.
   * Если передается большой объект (например, если не отфильтрованы ненужные переменные окружения
   * при создании конфига), то лучше использовать метод `setExtra`, иначе Sentry обрежет часть данных в GUI,
   * но они все еще будут доступны в "сырых" данных.
   * @see https://docs.sentry.io/enriching-error-data/additional-data/?platform=javascript#debugging-additional-data
   */
  scope.setContext('App config', config);
};
