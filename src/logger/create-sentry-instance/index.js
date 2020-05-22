import { createService } from '../../container';
import isFunction from 'lodash/isFunction';
import negate from 'lodash/negate';

const notFunc = negate(isFunction);

// Ключи перехватчиков, которые должен имплементировать экземпляр.
const CAPTURE_METHODS_KEYS = [
  'captureException',
  'captureMessage',
  'addBreadcrumb',
];

/**
 * @typedef {Object} SentryInstance Экземпляр Sentry.
 * @property {Function} init Были ли запрос совершен успешно.
 * @property {Function} captureException  Функция отправки ошибки.
 * @property {Function} captureMessage Функция отправки сообщения.
 * @property {Function} addBreadcrumb Функция прикрепления последовательности действий.
 */

/**
 * Создает новый экземпляр Sentry.
 * @param {Object} sentry Объект Sentry, имплементирующий методы для создания экземпляра.
 * @param {Function} [sentry.BrowserClient] Конструктор экземпляра в sdk браузера.
 * @param {Function} [sentry.NodeClient] Конструктор экземпляра в sdk Node.
 * @param {Function} sentry.Hub Конструктор концентратора (связывает экземпляр с областью видимости).
 * @return {SentryInstance} Экземпляр Sentry.
 */
export const createSentryInstance = ({ BrowserClient, NodeClient, Hub }) => {
  const CurrentClient = BrowserClient || NodeClient;

  if (notFunc(CurrentClient)) {
    throw new TypeError('Параметр "BrowserClient"/"NodeClient" должен быть функцией');
  }

  if (notFunc(Hub)) {
    throw new TypeError('Параметр "Hub" должен быть функцией');
  }

  const hub = new Hub();

  /**
   * Функция инициализации нового экземпляра Sentry.
   * @param {Object} options Опции инициализации.
   */
  const init = options => {
    const client = new CurrentClient(options);
    hub.bindClient(client);
  };

  const captureMethods = Object.fromEntries(
    CAPTURE_METHODS_KEYS.map(key => [key, (...args) => hub[key](...args)])
  );

  return {
    init,
    ...captureMethods,
  };
};

/**
 * Функция преобразования зависимостей сервиса в аргументы функции.
 * @param {Object} dependencies Зависимости.
 * @return {Array} Массив аргументов.
 */
export const deptToArg = ({ sentry }) => [sentry];

export default createService(
  createSentryInstance,
  deptToArg,
);
