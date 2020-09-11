import isFunction from 'lodash/isFunction';
import isNumeric from '../helpers/utils/is-numeric';

/**
 * Время ожидания до принудительного завершения процесса приложения по умолчанию.
 * @type {number}
 */
export const defaultExitTimeout = 20000;

/**
 * Декорирует http-сервер, добавляя остановку при завершении процесса node-приложения.
 * @param {import('http').Server} server Экземпляр класса http.Server.
 * @param {Object} [options] Экземпляр класса http.Server.
 * @param {Function} [options.onSuccess] Будет вызвана перед завершением процесса в случае успешного завершения.
 * @param {Function} [options.onError] Будет вызвана перед принудительным завершением процесса.
 * @param {number} [options.timeout=20000] Время ожидания остановки, после которого выполнится принудительная остановка.
 */
export const decorateGracefulShutdown = (server, options) => {
  const handleShutdown = createShutdownHandler(server, options);

  // e.g. kill
  process.on('SIGTERM', handleShutdown);

  // e.g. Ctrl + C
  process.on('SIGINT', handleShutdown);
};

/**
 * Возвращает функцию, которая запускает остановку http-сервера и завершает процесс приложения принудительно.
 * @param {import('http').Server} server Экземпляр класса http.Server.
 * @param {Object} [options] Экземпляр класса http.Server.
 * @param {Function} [options.onSuccess] Будет вызвана перед завершением процесса.
 * @param {Function} [options.onError] Будет вызвана перед завершением процесса.
 * @param {number} [options.timeout=20000] Время ожидания остановки, после которого выполнится принудительная остановка.
 * @return {Function} Функция, запускающая остановку http-сервера и завершающая процесс приложения принудительно.
 */
export const createShutdownHandler = (
  server,
  {
    onError,
    onSuccess,
    timeout = defaultExitTimeout,
  } = {}
) => {
  const validTimeout = isNumeric(timeout)
    ? Number(timeout)
    : defaultExitTimeout;

  return () => {
    server.close(createCloseHandler(0, onSuccess));
    setTimeout(createCloseHandler(1, onError), validTimeout); // принудительное завершение
  };
};

/**
 * Возвращает функцию, которая завершает процесс node-приложения с определенным кодом.
 * @param {number} [exitCode=0] Код завершения процесса.
 * @param {Function} [onClose] Функция, которая будет вызвана перед завершением процесса.
 * @return {Function} Функция завершения процесса.
 */
export const createCloseHandler = (exitCode = 0, onClose) => () => {
  isFunction(onClose) && onClose(exitCode);
  process.exit(exitCode);
};

/**
 * Создаёт обработчики событий завершения приложения.
 * @param {Object} options Опции.
 * @param {Object} options.logger Логгер.
 * @param {Object} [options.config] Конфигурация приложения.
 * @param {string} options.message Сообщение, которое будет залоггировано в консоль.
 * @return {Function} Обработчик завершения приложения.
 */
export const onExitHandlerCreator = ({ logger, config, message }) => () => {
  const { isDevelopment = true } = config || {};
  isDevelopment && logger.info(message);
};

/**
 * Сервис для реализации лёгкого завершения приложения.
 * @param {Object} options Опции.
 * @param {Function} options.onExitError Обработчик завершения с ошибкой.
 * @param {Function} options.onExitSuccess Обработчик успешного завершения.
 * @param {number} options.processExitTimeout Максимальное время, отведённое приложению на завершение.
 * @return {Function} Функция, реализующая лёгкое завершение приложения.
 */
export const gracefulShutdownCreator = (
  {
    onExitError: onError,
    onExitSuccess: onSuccess,
    processExitTimeout: timeout,
  }
) => server => decorateGracefulShutdown(server, {
  onError,
  onSuccess,
  timeout,
});
