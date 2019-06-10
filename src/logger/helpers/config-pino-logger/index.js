import mapValues from 'lodash/mapValues';
import isFunction from 'lodash/isFunction';
import { hrtimeToInteger } from '../hr-time-to-integer';

/**
 * Обработчик завершения запроса
 */
export const finishHandler = function () {
  this.removeListener('error', finishHandler);
  this.removeListener('finish', finishHandler);

  const NS_PER_MSEC = 1e6;
  const logData = mapValues(
    this.logData,
    value => isFunction(value)
      ? value({
        request: this.request,
        response: this,
      })
      : value
  );

  this.log({
    ...logData,
    latency: (hrtimeToInteger(process.hrtime()) - this.startTime) / NS_PER_MSEC,
  });
};

/**
 * Конфигуратор логгера
 * @param {Object} options Настройки логгера
 * @param {Object} options.logger Экземпляр логгера
 * @param {Object} options.staticData Статические данные
 * @param {Object} options.dynamicData Динамические данные
 * @return {Function} middleware для логгирования запросов
 */
export default function configPinoLogger (options = {}) {
  if (!options.logger) {
    throw Error('Необходимо передать экземпляр логгера');
  }

  /**
   * Функция, возвращаемая middleware
   * @param {Object} req Запрос
   * @param {Object} res Ответ
   * @param {Function} next Функция для передачи контекста следующему middleware
   */
  const middleware = (req, res, next) => {
    res.logData = {
      ...options.staticData,
      ...options.dynamicData,
    };
    res.log = options.logger.info.bind(options.logger);
    res.startTime = res.startTime || hrtimeToInteger(process.hrtime());
    res.request = req;
    res.on('finish', finishHandler);
    res.on('error', finishHandler);

    if (isFunction(next)) {
      next();
    }
  };
  middleware.logger = options.logger;

  return middleware;
}
