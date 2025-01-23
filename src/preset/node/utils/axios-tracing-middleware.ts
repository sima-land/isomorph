import type { AxiosInstance, AxiosRequestConfig, HeadersDefaults } from 'axios';
import type { Middleware } from 'middleware-axios';
import { Context, Tracer, SpanStatusCode } from '@opentelemetry/api';
import {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_URL_FULL,
} from '@opentelemetry/semantic-conventions/incubating';
import { displayUrl } from '../../isomorphic/utils/display-url';
import { getSemanticHeaders } from './telemetry';

/**
 * Возвращает новый middleware для трассировки исходящих запросов.
 * @param tracer Трейсер.
 * @param rootContext Контекст.
 * @return Middleware.
 */
export function axiosTracingMiddleware(tracer: Tracer, rootContext: Context): Middleware<any> {
  return async function trace(config, next, defaults) {
    const { method, urlStr } = getRequestInfo(config, defaults);
    const url = new URL(urlStr);
    const span = tracer.startSpan(`axios ${method} ${url}`, undefined, rootContext);

    span.setAttributes({
      [ATTR_URL_FULL]: url.href,
      [ATTR_HTTP_REQUEST_METHOD]: method,
      ...getSemanticHeaders({
        // @todo непонятно как доставать заголовки из defaults потому что там на одном уровне заголовки и таблицы заголовков
        ...defaults.headers.common,
        ...defaults.headers[method.toLowerCase() as keyof HeadersDefaults],
        ...config.headers,
      }),
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
 * @param config Axios-конфиг запроса.
 * @param defaults Базовый конфиг экземпляра Axios.
 * @return Базовые данные запроса.
 */
export function getRequestInfo(
  config: AxiosRequestConfig,
  defaults: AxiosInstance['defaults'],
): {
  method: string;
  urlStr: string;
} {
  const method = (config.method || 'GET').toUpperCase();
  const baseURL = config.baseURL || defaults.baseURL || '';

  return {
    method,
    urlStr: displayUrl(baseURL, config.url || defaults.url || ''),
  };
}
