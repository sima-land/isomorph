import type { Middleware } from '../../../http';
import { SpanStatusCode, type Context, type Tracer } from '@opentelemetry/api';
import { ATTR_HTTP_REQUEST_METHOD, ATTR_URL_FULL } from '@opentelemetry/semantic-conventions';
import { getSemanticHeaders } from './telemetry';

/**
 * Вернет новый промежуточный слой трассировки для fetch.
 * @param tracer Трассировщик.
 * @param rootContext Контекст.
 * @return Промежуточный слой трассировки.
 */
export function getFetchTracing(tracer: Tracer, rootContext: Context): Middleware {
  return async (request, next) => {
    const url = new URL(request.url);
    const span = tracer.startSpan(
      `fetch ${request.method} ${url.pathname}`,
      undefined,
      rootContext,
    );

    span.setAttributes({
      [ATTR_URL_FULL]: url.href,
      [ATTR_HTTP_REQUEST_METHOD]: request.method,
      ...getSemanticHeaders(request.headers),
    });

    try {
      const response = await next(request);

      span.end();

      return response;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: 'HTTP Request failed',
      });

      span.end();

      // ВАЖНО: не прячем ошибку
      throw error;
    }
  };
}
