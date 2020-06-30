import { Tags, FORMAT_HTTP_HEADERS } from 'opentracing';
import propOr from 'lodash/fp/propOr';

const getParams = propOr({}, 'params');

/**
 * Создаёт middleware для трассировки запросов в API.
 * @param {Object} options Параметры для создания middleware.
 * @param {Object} options.context Объект родительского контекста.
 * @param {Object} options.tracer Объект трейсера.
 * @return {function(Object, Function): Promise} Middleware для трассироваки запросов в API.
 */
const createTraceRequestMiddleware = ({ context, tracer }) =>

  /**
   * Middleware для трассировки запросов в API.
   * @param {Object} requestConfig Параметры для создания middleware.
   * @param {Function} next Функция для получения данных.
   * @return {Promise} Promise.
   */
  async (requestConfig, next) => {
    const fullUrl = `${requestConfig.baseURL}${requestConfig.url}`;
    const span = tracer.startSpan(`HTTP ${requestConfig.method.toUpperCase()} ${fullUrl}`, {
      childOf: context,
    });
    if (!requestConfig.headers) {
      requestConfig.headers = {};
    }

    span.addTags({
      [Tags.HTTP_URL]: fullUrl,
      [Tags.HTTP_METHOD]: requestConfig.method.toUpperCase(),
      'request.params': getParams(requestConfig),
      'request.headers': { ...requestConfig.headers },
    });

    tracer.inject(span, FORMAT_HTTP_HEADERS, requestConfig.headers);
    const response = await next(requestConfig);
    span.setTag(Tags.HTTP_STATUS_CODE, response.status);
    span.finish();
  };

export default createTraceRequestMiddleware;
