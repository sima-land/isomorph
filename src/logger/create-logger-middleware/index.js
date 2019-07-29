import mapValues from 'lodash.mapvalues';
import isFunction from 'lodash.isfunction';
import { createObserveMiddleware } from '../../observe-middleware';

/**
 * Конструктор для создания middleware для express-приложения.
 * @param {Object} dependencies Зависимости.
 * @param {string|number} dependencies.config Конфигурация.
 * @param {Function} dependencies.pinoLogger Экземпляр логгера.
 * @param {Object} dependencies.dynamicData Динамические данные которые необходимо получить после завершения запроса.
 * @return {Function} Middleware для express-приложения.
 */
export default function createLoggerMiddleware (dependencies = {}) {
  const {
    pinoLogger,
    config = {},
    dynamicData = {},
  } = dependencies;

  if (!pinoLogger) {
    throw Error('First argument property "pinoLogger" is empty.');
  }

  if (!Object.values(dynamicData).every(isFunction)) {
    throw TypeError('Every data getter in "dynamicData" must be Function.');
  }

  return createObserveMiddleware({
    onFinish: (timestamp, request, response) => {
      const data = mapValues(dynamicData, metric => metric({ request, response }));
      pinoLogger.info({
        ...data,
        version: config.version,
        latency: timestamp,
      });
    },
  });
}
