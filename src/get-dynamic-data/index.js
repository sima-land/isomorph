import { getMethod, getStatus, getXClientIp, getOriginalUrl } from '../helpers/http/request-getters';

/**
 * Получает данные API для логирования.
 * @param {Object} params Входные параметры.
 * @param {Object} params.response Ответ.
 * @param {string} params.timeDataKey Поле в response.local, из которого следует запрашивать log data.
 * @return {number} Статус ответа.
 */
export const getApiLogData = ({ response, timeDataKey }) => response.locals[timeDataKey] || {};

/**
 * Возвращает динамически получаемые данные.
 * @param {Object} dependencies Зависимости.
 * @param {Object} dependencies.config Конфигурация.
 * @param {string} dependencies.timeDataKey Поле в response.local, из которого следует запрашивать log data.
 * @return {Object} Объект с данными.
 */
export const getDynamicData = ({ config, timeDataKey = 'logData' }) => (request, response) => ({
  remote_ip: getXClientIp({ request }),
  method: getMethod({ request }),
  status: getStatus({ response }),
  route: getOriginalUrl({ request }),
  ...getApiLogData({ response, timeDataKey }),
  version: config.version,
});
