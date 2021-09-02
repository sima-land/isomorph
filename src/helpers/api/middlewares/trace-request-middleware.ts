import { Middleware } from 'middleware-axios';
import { Tracer, Tags, FORMAT_HTTP_HEADERS, SpanContext } from 'opentracing';

/**
 * Создаёт middleware для трассировки запросов в API.
 * @param options Параметры для создания middleware.
 * @param options.tracer Объект трейсера.
 * @param options.context Объект родительского контекста.
 * @return Middleware для трассировки запросов в API.
 */
const createTraceRequestMiddleware = ({ tracer, context }: {
  tracer: Tracer;
  context: SpanContext;
}): Middleware<any> => async function (config, next, defaults) {
    const url = config.url || defaults.url || '';
    const baseURL = config.baseURL || defaults.baseURL || '';
    const methodName = (config.method || 'GET').toUpperCase();

    const [readyUrl, foundId] = hideFirstId(`${baseURL}${url}`);

    const span = tracer.startSpan(`HTTP ${methodName} ${readyUrl}`, {
      childOf: context,
    });

    if (!config.headers) {
      config.headers = {};
    }

    span.addTags({
      [Tags.HTTP_URL]: readyUrl,
      [Tags.HTTP_METHOD]: methodName,
      'request.params': { ...config.params },
      'request.headers': { ...config.headers },

      // если нашли id - добавляем в теги
      ...(foundId && { 'request.id': foundId }),
    });

    tracer.inject(span, FORMAT_HTTP_HEADERS, config.headers);

    const response = await next(config);

    span.setTag(Tags.HTTP_STATUS_CODE, response.status);
    span.finish();
  };

/**
 * Преобразует строку вида:
 * "/api/v2/something/123456/some-bff/123456"
 * в строку вида:
 * "/api/v2/something/{id}/some-bff/123456"
 * и возвращает кортеж с этой строкой и вырезанным числом в случае если оно найдено.
 * @param url Url.
 * @return Кортеж со строкой и результатом поиска числа.
 */
export const hideFirstId = (url: string): [string, number | undefined] => {
  const found = /\d{2,}/.exec(url);

  return found
    ? [url.replace(found[0], '{id}'), Number(found[0])]
    : [url, undefined];
};

export default createTraceRequestMiddleware;
