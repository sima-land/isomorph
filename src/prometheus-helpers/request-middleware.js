import negate from 'lodash/negate';
import isFunction from 'lodash/isFunction';
import { isPrometheusMetric } from './metric-adapter.js';
import { createObserveMiddleware } from '../observe-middleware/';

/**
 * Возвращает функцию, создающую модуль для замера метрик запросов Express-приложения.
 * @param {Object} dependencies Опции.
 * @param {Function} dependencies.resolveLabels Функция, результат которой будет использован как аргумент setLabels.
 * @param {Array} dependencies.startMetrics Список метрик, замеряемых при старте запроса.
 * @param {Array} dependencies.finishMetrics Список метрик, замеряемых при отправке ответа.
 * @return {Function} Функция, возвращающая промежуточный слой для использования в Express-приложении.
 */
export const createRequestMiddleware = (dependencies = {}) => {
  const {
    resolveLabels = Object,
    startMetrics = [],
    finishMetrics = [],
  } = dependencies || {};
  if (!isFunction(resolveLabels)) {
    throw TypeError('First argument property "resolveLabels" must be a function');
  }

  if ([startMetrics, finishMetrics].some(negate(Array.isArray))) {
    throw TypeError('First argument properties "startMetrics" and "finishMetrics" must be arrays');
  }

  if ([...startMetrics, ...finishMetrics].some(negate(isPrometheusMetric))) {
    throw TypeError('Every metric in "startMetrics" and "finishMetrics" must be instance of PrometheusMetric');
  }

  return createObserveMiddleware({
    onStart: (timestamp, request, response) => {
      startMetrics.forEach(metric => {
        metric
          .setLabels(resolveLabels({
            dependencies,
            metric,
            request,
            response,
            timestamp,
          }))
          .spot();
      });
    },
    onFinish: (duration, request, response) => {
      finishMetrics.forEach(metric => {
        metric
          .setLabels(resolveLabels({
            dependencies,
            duration,
            metric,
            request,
            response,
          }))
          .spot(duration);
      });
    },
  });
};
