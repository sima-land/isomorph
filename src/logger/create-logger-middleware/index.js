import configPinoLogger from '../../helpers/logger/config-pino-logger';
import createPinoInstance from '../../helpers/logger/create-pino-instance';

/**
 * Конструктор для создания middleware для express-приложения.
 * @param {Object} config Конфигурация.
 * @param {string|number} version Версия.
 * @param {Function} getXClientIp Хелпер, который получает IP пользователя из заголовков запроса.
 * @param {Function} getMethod Хелпер, который получает метод запроса из объекта запроса.
 * @param {Function} getStatus Хелпер, который получает статус ответа из объекта ответа.
 * @return {Function} Middleware для express-приложения.
 */
export default function createLoggerMiddleware (
  {
    config,
    config: {
      version,
    },
    helpers: {
      getXClientIp,
      getMethod,
      getStatus,
    },
  },
) {
  return configPinoLogger({
    logger: createPinoInstance({ config }),
    staticData: {
      version,
    },
    dynamicData: {
      remote_ip: getXClientIp,
      method: getMethod,
      status: getStatus,
    },
  });
}
