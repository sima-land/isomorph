import isFunction from 'lodash.isfunction';
import { createObserveMiddleware } from '../../observe-middleware';

/**
 * Конструктор для создания middleware для express-приложения.
 * @param {Object} dependencies Зависимости.
 * @param {Function} dependencies.pinoLogger Экземпляр логгера.
 * @param {Function} dependencies.getDynamicData
 * Функция, формирующая данные, которые нужно получить после завершения запроса.
 * @return {Function} Middleware для express-приложения.
 */
export default function createLoggerMiddleware (dependencies = {}) {
  const {
    pinoLogger,
    getDynamicData,
  } = dependencies;

  if (!pinoLogger) {
    throw Error('First argument property "pinoLogger" is empty.');
  }

  if (!isFunction(getDynamicData)) {
    throw TypeError('"getDynamicData" must be Function.');
  }

  return createObserveMiddleware({
    onFinish: (timestamp, request, response) => {
      pinoLogger.info({
        ...getDynamicData(request, response),
        latency: timestamp,
      });
    },
  });
}
