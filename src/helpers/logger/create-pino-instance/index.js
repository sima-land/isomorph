import pino from 'pino';
import formatTime from '../format-time';
import isPlainObject from 'lodash.isplainobject';

/**
 * Модуль создающий экземпляр логгера.
 * @param {Object} options Зависимости модуля.
 * @return {Function} Функция, которая создает логгер.
 */
export default function createPinoInstance ({ config } = {}) {
  /**
   * Функция, которая создает экземпляр логгера.
   * @param {Object} param Параметры.
   * @param {string|number} param.timestamp Время.
   * @param {boolean} param.isProduction Является ли production-сборкой.
   * @param {boolean} param.hasColorize Нужно ли выделять цветом.
   * @return {Function} Экземпляр логгера.
   */
  const loggerCreator = (
    {
      timestamp,
      isProduction,
      hasColorize,
    }
  ) => {
    const logger = pino({
      timestamp,
      prettyPrint: hasColorize && { colorize: true },
      useLevelLabels: true,
    });
    logger.extreme = isProduction;

    return logger;
  };

  return loggerCreator({
    timestamp: formatTime,
    isProduction: isPlainObject(config) ? config.isProduction : true,
    hasColorize: isPlainObject(config) ? config.isDevelopment : false,
  });
}
