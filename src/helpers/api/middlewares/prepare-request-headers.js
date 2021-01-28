import omit from 'lodash/omit';
import { getCookie, getXClientIp } from '../../http/request-getters';
import { getServiceHeaders, getServiceUserAgent } from './helpers';

/**
 * Формирует объект заголовков из конфигурации приложения и запроса к приложению.
 * @param {Object} options Опции сервиса.
 * @param {Object} options.config Конфигурация приложения.
 * @param {import('http').IncomingMessage} options.request Запрос приложения.
 * @param {string|string[]} options.exclude Заголовки, которые требуется исключить из итогового списка.
 * @return {Object} Заголовки.
 */
export const prepareRequestHeaders = ({ config, request, exclude = [] }) => omit({
  'X-Client-Ip': getXClientIp({ request }),
  'User-Agent': getServiceUserAgent(config),
  Cookie: getCookie(request),
  ...getServiceHeaders(request),
}, exclude);
