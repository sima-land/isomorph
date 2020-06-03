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
  (error, { sagaStack }) => captureExtendedException(error, sagaStack, 'Sagas stack');

/**
 * Возвращает обработчик ошибки, передающий ошибку Sentry.
 * @param {Function} captureException Метод захвата ошибки Sentry.
 * @return {Function} Обработчик ошибки.
 */
export const createSentryHandlerForStore = ({ sentry: { captureException } }) =>
  () => captureException(new Error('Ожидание готовности store было прервано по таймауту'));
