import http from 'http';
import https from 'https';

/**
 * Добавляет в конфигурацию запроса опции httpAgent и httpsAgent.
 * @param {Object} options Параметры для создания middleware.
 * @param {https.Agent} options.httpsAgent Кастомизированный экземпляр https.Agent.
 * @param {http.Agent} options.httpAgent Кастомизированный экземпляр  http.Agent.
 * @return {function(Object, Function):Promise} Middleware для использования в API.
 */
const createSetHttpAgentsMiddleware = ({ httpsAgent, httpAgent }) =>
  async (requestConfig, next) => {
    if (httpAgent instanceof http.Agent) {
      requestConfig.httpAgent = httpAgent;
    }
    if (httpsAgent instanceof https.Agent) {
      requestConfig.httpsAgent = httpsAgent;
    }
    await next(requestConfig);
  };

export default createSetHttpAgentsMiddleware;
