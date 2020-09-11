import { initTracerFromEnv } from 'jaeger-client';
import { FORMAT_HTTP_HEADERS } from 'opentracing';
import { createObserveMiddleware } from '../../observe-middleware/';
import isFunction from 'lodash/isFunction';
import get from 'lodash/get';
import { createService } from '../../container';
import isPlainObject from 'lodash/isPlainObject';
import { getOriginalUrl } from '../http/request-getters';
import mapValues from 'lodash/fp/mapValues';

const mapValuesWithKey = mapValues.convert({ cap: false });

/**
 * Возвращает новый объект, в котором заменено значение свойств, имена которых содержат 'Password'.
 */
const filterSecrets = mapValuesWithKey((value, key) => key.includes('Password') ? '[Filtered]' : value);

/**
 * Запускает трассировку входящего http-запроса.
 * @param {Object} tracer Экземпляр трейсера.
 * @param {string} key Ключ.
 * @param {Object} httpRequest Запрос.
 * @param {Object} [payload] Дополнительная информация для добавления к спану.
 * @return {Object} Спан.
 */
export const traceIncomingRequest = (tracer, key, httpRequest, payload) =>
  tracer
    .startSpan(
      key,
      {
        childOf: tracer.extract(FORMAT_HTTP_HEADERS, httpRequest.headers),
      }
    )
    .addTags(isPlainObject(payload) ? payload : {});

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
 * @private
 */
export const _createTracingMiddleware = (
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

/**
 * Функция преобразования зависимостей сервиса в аргументы функции.
 * @param {Object} dependencies Зависимости.
 * @return {Array} Массив аргументов.
 * @private
 */
export const _deptToArg = ({ createSpan, onSpanFinish, options }) => [createSpan, onSpanFinish, options];

/**
 * Возвращает сервис для создания промежуточного слоя трассировки.
 * @return {Function} Сервис.
 */
export const tracingMiddlewareCreator = createService(
  _createTracingMiddleware,
  _deptToArg
);

/**
 * Сервис для создания span-ов трейсинга.
 * @param {Object} dependencies Параметры сервиса.
 * @param {Object} dependencies.jaegerTracer Трейсер.
 * @param {Object} dependencies.config Конфигурация приложения.
 * @return {Function} Функция для создания спана.
 */
export const createSpanCreator = ({ jaegerTracer, config }) => request => traceIncomingRequest(
  jaegerTracer,
  'incoming-http-request',
  request,
  _getRequestContext(request, config),
);

/**
 * Обработчик завершения трейса.
 * @param {import('http').IncomingMessage} req Запрос.
 * @param {import('http').ServerResponse} res Ответ.
 * @param {import('opentracing').Span} span Спан.
 */
export const spanFinishHandler = (req, res, span) => {
  span.finish();
};

/**
 * Возвращает контекст, в котором обрабатывается запрос к сервису, для добавления в span.
 * @param {import('http').IncomingMessage} request Запрос.
 * @param {Object} config Конфигурация приложения.
 * @return {Object} Контекст.
 * @private
 */
export const _getRequestContext = (request, config) => {
  const context = {
    'request.path': getOriginalUrl({ request }),
    'app.config': isPlainObject(config) ? filterSecrets(config) : '',
  };

  if (isPlainObject(request.headers) && isFunction(request.get)) {
    Object.keys(request.headers).forEach(key => {
      if (key.toLowerCase().startsWith('simaland-')) {
        context[`request.headers.${key}`] = request.get(key);
      }
    });
  }

  return context;
};
