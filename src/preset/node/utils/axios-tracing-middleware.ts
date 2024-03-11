import type { AxiosDefaults, AxiosRequestConfig } from 'axios';
import type { Middleware } from 'middleware-axios';
import { Context, Tracer, SpanStatusCode } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { displayUrl } from '../../isomorphic/utils/display-url';
import { hideFirstId } from '../../isomorphic/utils/hide-first-id';

/**
 * Возвращает новый middleware для трассировки исходящих запросов.
 * @param tracer Трейсер.
 * @param rootContext Контекст.
 * @return Middleware.
 */
export function axiosTracingMiddleware(tracer: Tracer, rootContext: Context): Middleware<any> {
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
