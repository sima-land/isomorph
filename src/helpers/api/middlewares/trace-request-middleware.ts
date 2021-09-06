import type { AxiosRequestConfig } from 'axios';
import type { Middleware } from 'middleware-axios';
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
    const { method, url, foundId } = getRequestInfo(config, defaults);

    const span = tracer.startSpan(`HTTP ${method} ${url}`, {
      childOf: context,
    });

    if (!config.headers) {
      config.headers = {};
    }

    span.addTags({
      [Tags.HTTP_URL]: url,
      [Tags.HTTP_METHOD]: method,
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
 * Формирует базовые данные запроса.
 * Заменяет первое найденное число в url на "{id}", возвращая его в результате.
 * @param config Axios-конфиг запроса.
 * @param defaults Базовый конфиг экземпляра Axios.
 * @return Базовые данные запроса.
 */
const getRequestInfo = (
  config: AxiosRequestConfig,
  defaults: AxiosRequestConfig
): {
  method: string;
  url: string;
  foundId?: number;
} => {
  const method = (config.method || 'GET').toUpperCase();
  const baseURL = config.baseURL || defaults.baseURL || '';

  // ВАЖНО: абстрагируем id только в url игнорируя baseURL
  const [url, foundId] = hideFirstId(config.url || defaults.url || '');
  const readyUrl = `${baseURL}${url}`;

  return { method, url: readyUrl, foundId };
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
