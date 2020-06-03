import pipe from 'lodash/fp/pipe';
import path from 'lodash/fp/path';
import pickBy from 'lodash/fp/pickBy';

// Префикс сервисных заголовков.
const SERVICE_PREFIX = 'Simaland-';

/**
 * Возвращает объект заголовков, содержащих в своем названии префикс сервисных заголовков.
 * @param {import('http').IncomingMessage} request Запрос приложения.
 * @param {Object} request.headers Заголовки запроса.
 * @return {Object.<string, string>} Коллекция сервисных заголовков.
 */
export const getServiceHeaders = pipe(
  path('headers'),
  pickBy((value, key) => key.toLowerCase().indexOf(SERVICE_PREFIX.toLowerCase()) === 0)
);

/** Формирует из параметров конфигурации и возвращает User-Agent.
 * @param {Object} config Конфигурация приложения.
 * @param {string} config.serviceName Название сервиса из конфигурации.
 * @param {string} config.version Версия приложения.
 * @return {string} User-Agent.
 */
export const getServiceUserAgent = ({ serviceName, version } = {}) =>
  serviceName && version ? `simaland-${serviceName}/${version}` : '';
