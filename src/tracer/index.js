import { initTracerFromEnv } from 'jaeger-client';
import { FORMAT_HTTP_HEADERS } from 'opentracing';

/**
 * Стартует трейсинг входящего http-запроса
 * @param {Function} tracer Функция трассировки
 * @param {string} key Ключ
 * @param {Object} httpRequest Запрос
 * @return {Object} Функция создающая спан
 */
export const traceIncomingRequest = (tracer, key, httpRequest) => tracer.startSpan(key,
  { childOf: tracer.extract(FORMAT_HTTP_HEADERS, httpRequest.headers) });

/**
 * Создаёт новый или возвращает существующий экземпляр jaeger-трейсера
 * @param {Object} param Объект с параметрами
 * @param {Object} param.config Объект с параметрами
 * @param {Object} param.config.tracerConfig Конфиг трейсера
 * @param {string} param.config.serviceName Название сервиса
 * @param {number} param.config.buildVersion Версия сборки
 * @param {Object} param.metrics Метрики
 * @param {Object} param.logger Логгер
 * @return {Tracer} Объект трейсера
 */
export const getTracer = ({ config: { tracerConfig = {},
  buildVersion, serviceName }, metrics, logger }) => initTracerFromEnv(
  {
    serviceName,
    ...tracerConfig,
  },
  {
    tags: {
      [`${serviceName}.version`]: buildVersion,
    },
    metrics,
    logger,
  });
