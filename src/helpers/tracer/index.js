import { initTracerFromEnv } from 'jaeger-client';
import { FORMAT_HTTP_HEADERS } from 'opentracing';
import { createObserveMiddleware } from '../../observe-middleware/';
import isFunction from 'lodash/isFunction';
import get from 'lodash/get';

/**
 * Запускает трассировку входящего http-запроса.
 * @param {Function} tracer Функция трассировки.
 * @param {string} key Ключ.
 * @param {Object} httpRequest Запрос.
 * @return {Object} Спан.
 */
export const traceIncomingRequest = (tracer, key, httpRequest) => tracer.startSpan(
  key,
  {
    childOf: tracer.extract(FORMAT_HTTP_HEADERS, httpRequest.headers),
  }
);

/**
 * Создаёт новый или возвращает существующий экземпляр jaeger-трейсера.
 * @param {Object} dependencies Зависимости.
 * @param {Object} dependencies.tracerConfig Основные параметры конфигурации трейсера.
 * @param {string} dependencies.tracerConfig.serviceName Название сервиса.
 * @param {number} dependencies.tracerConfig.version Версия сборки.
 * @param {Object} [dependencies.additionalConfig={}] Дополнительные параметры конфигурации трейсера.
 * @return {import('opentracing').Tracer} Объект трейсера.
 */
export const getTracer = ({
  tracerConfig: {
    version,
    serviceName,
  },
  additionalConfig = {},
}) => initTracerFromEnv(
  {
    serviceName,
    ...additionalConfig,
  },
  {
    tags: {
      [`${serviceName}.version`]: version,
    },
  }
);

/**
 * Возвращает функцию - промежуточный слой для маршрутов express-приложения.
 * Сигнализирует о начале и конце запроса.
 * @param {Function} createSpan Функция возвращающая новый объект span, вызываемая при старте запроса.
 * @param {Function} onSpanFinish Функция получающая созданный span, вызываемая при ответе.
 * @param {Object} [options] Необязательные опции.
 * @param {string} [options.spanKey='span'] Ключ, под которым будет сохранен span в response.locals.
 * @return {Function} Функция - промежуточный слой для маршрутов.
 */
export const createTracingMiddleware = (
  createSpan,
  onSpanFinish,
  { spanKey = 'span' } = {}
) => {
  const hasSpanCreator = isFunction(createSpan);
  const hasFinishHandler = isFunction(onSpanFinish);

  return createObserveMiddleware({
    onStart: (startTime, request, response) => {
      if (hasSpanCreator) {
        response.locals[spanKey] = createSpan(request, response);
      }
    },
    onFinish: (duration, request, response) => {
      if (hasFinishHandler) {
        onSpanFinish(request, response, response.locals[spanKey]);
      }
    },
  });
};

/**
 * Получает контекст из объекта текущего ответа.
 * @param {Object} response Объект с параметрами текущего ответа.
 * @return {Object|null} Текущий контекст.
 */
export const getSpanContext = ({ response }) => {
  let context;
  if (isFunction(get(response, 'locals.span.context'))) {
    context = response.locals.span.context();
  }
  return context || null;
};
