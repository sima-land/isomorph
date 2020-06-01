/**
 * Возвращает обработчик ошибки, передающий ошибку Sentry.
 * @param {Function} captureExtendedException Метод захвата ошибки Sentry.
 * @return {Function} Обработчик ошибки.
 */
const createSentryHandlerForSagas = ({ sentry: { captureExtendedException } }) =>

  /**
   * Обработчик ошибки, передающий ошибку методу Sentry.
   * @param {Error} error Объект ошибки.
   * @param {string} sagaStack Стек вызовов саг.
   */
  (error, { sagaStack }) => captureExtendedException(error, sagaStack, 'Sagas stack');

export default createSentryHandlerForSagas;
