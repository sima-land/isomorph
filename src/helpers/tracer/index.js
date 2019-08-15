import { initTracerFromEnv } from 'jaeger-client';
import { FORMAT_HTTP_HEADERS } from 'opentracing';
import { createObserveMiddleware } from '../../observe-middleware/';
import isFunction from 'lodash.isfunction';
import get from 'lodash.get';

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
 * @param {Object} param Объект с параметрами.
 * @param {Object} param.config Объект с параметрами.
 * @param {Object} param.config.tracerConfig Конфиг трейсера.
 * @param {string} param.config.serviceName Название сервиса.
 * @param {number} param.config.buildVersion Версия сборки.
 * @param {Object} param.metrics Метрики.
 * @param {Object} param.logger Логгер.
 * @return {Tracer} Объект трейсера.
 */
export const getTracer = ({
  config: {
    tracerConfig = {},
    buildVersion,
    serviceName,
  },
}) => initTracerFromEnv(
  {
    serviceName,
    ...tracerConfig,
  },
  {
    tags: {
      [`${serviceName}.version`]: buildVersion,
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
