import type { AxiosDefaults, AxiosRequestConfig } from 'axios';
import type { Middleware } from 'middleware-axios';
import { Context, Tracer, SpanStatusCode } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';

/**
 * Возвращает новый middleware для трассировки исходящих запросов.
 * @param tracer Трейсер.
 * @param rootContext Контекст.
 * @return Middleware.
 */
export function tracingMiddleware(tracer: Tracer, rootContext: Context): Middleware<any> {
  return async function trace(config, next, defaults) {
    const { method, url, foundId } = getRequestInfo(config, defaults);
    const span = tracer.startSpan(`HTTP ${method} ${url}`, undefined, rootContext);

    span.setAttributes({
      [SemanticAttributes.HTTP_URL]: url,
      [SemanticAttributes.HTTP_METHOD]: method,
      'request.params': JSON.stringify({
        ...defaults.params,
        ...config.params,
      }),
      'request.headers': JSON.stringify({
        ...defaults.headers[method.toLowerCase() as 'get'],
        ...config.headers,
      }),

      // если нашли id - добавляем в теги
      ...(foundId && { 'request.id': foundId }),
    });

    try {
      await next(config);
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'HTTP Request failed',
      });

      span.end();

      // не прячем ошибку
      throw error;
    }

    span.end();
  };
}

/**
 * Формирует базовые данные запроса.
 * Заменяет первое найденное число в url на "{id}", возвращая его в результате.
 * @param config Axios-конфиг запроса.
 * @param defaults Базовый конфиг экземпляра Axios.
 * @return Базовые данные запроса.
 */
export function getRequestInfo(
  config: AxiosRequestConfig,
  defaults: AxiosDefaults,
): {
  method: string;
  url: string;
  foundId?: number;
} {
  const method = (config.method || 'GET').toUpperCase();
  const baseURL = config.baseURL || defaults.baseURL || '';

  // ВАЖНО: абстрагируем id только в url игнорируя baseURL
  const [url, foundId] = hideFirstId(config.url || defaults.url || '');

  return {
    method,
    url: displayUrl(baseURL, url),
    foundId,
  };
}

/**
 * Преобразует строку вида:
 * "/api/v2/something/123456/some-bff/123456"
 * в строку вида:
 * "/api/v2/something/{id}/some-bff/123456"
 * и возвращает кортеж с этой строкой и вырезанным числом в случае если оно найдено.
 * @param url Url.
 * @return Кортеж со строкой и результатом поиска числа.
 */
export function hideFirstId(url: string): [string, number | undefined] {
  const found = /\d{2,}/.exec(url);

  return found ? [url.replace(found[0], '{id}'), Number(found[0])] : [url, undefined];
}

/**
 * Объединяет значения опций baseURL и url (axios) в одну строку для логирования.
 * @param baseURL Опция baseURL.
 * @param url Опция url.
 * @return Отображение. Не является валидным URL.
 */
export function displayUrl(
  baseURL: AxiosRequestConfig['baseURL'] = '',
  url: AxiosRequestConfig['url'] = '',
) {
  let result: string;

  switch (true) {
    case Boolean(baseURL && url):
      result = `${baseURL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
      break;
    case Boolean(baseURL) && !url:
      result = baseURL;
      break;
    case !baseURL && Boolean(url):
      result = url;
      break;
    case !baseURL && !url:
    default:
      result = '[empty]';
      break;
  }

  return result;
}
