import isFunction from 'lodash.isfunction';
import isArray from 'lodash/isArray';
import { createObserveMiddleware } from '../../observe-middleware';
import { getOriginalUrl } from '../../helpers/http/request-getters';
import isMatchPatternList from '../../helpers/utils/is-match-pattern-list';

/**
 * Конструктор для создания middleware для express-приложения.
 * @param {Object} dependencies Зависимости.
 * @param {Function} dependencies.pinoLogger Экземпляр логгера.
 * @param {Function} dependencies.getDynamicData
 * Функция, формирующая данные, которые нужно получить после завершения запроса.
 * @param {string[]} dependencies.exclusions Массив шаблонов url для исключения из логирования.
 * @return {Function} Middleware для express-приложения.
 */
export default function createLoggerMiddleware (dependencies = {}) {
  const {
    pinoLogger,
    getDynamicData,
    exclusions = [],
  } = dependencies;

  if (!pinoLogger) {
    throw Error('First argument property "pinoLogger" is empty.');
  }

  if (!isFunction(getDynamicData)) {
    throw TypeError('"getDynamicData" must be Function.');
  }

  if (!isArray(exclusions)) {
    throw TypeError('"exclusions" must be array.');
  }

  return createObserveMiddleware({
    onFinish: (timestamp, request, response) => {
      const url = getOriginalUrl({ request });
      if (!isMatchPatternList(url, exclusions)) {
        pinoLogger.info({
          ...getDynamicData(request, response),
          latency: timestamp,
        });
      }
    },
  });
}
