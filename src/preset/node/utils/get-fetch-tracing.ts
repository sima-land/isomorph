import type { Middleware } from '../../../http';
import { SpanStatusCode, type Context, type Tracer } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { hideFirstId } from '../../isomorphic/utils/hide-first-id';

/**
 * Вернет новый промежуточный слой трассировки для fetch.
 * @param tracer Трассировщик.
 * @param rootContext Контекст.
 * @return Промежуточный слой трассировки.
 */
export function getFetchTracing(tracer: Tracer, rootContext: Context): Middleware {
  return async (request, next) => {
    const [url, foundId] = hideFirstId(new URL(request.url).pathname); // @todo тут бы помог URLPattern
    const span = tracer.startSpan(`HTTP ${request.method} ${url}`, undefined, rootContext);

    span.setAttributes({
      [SemanticAttributes.HTTP_URL]: url,
      [SemanticAttributes.HTTP_METHOD]: request.method,
      'request.params': JSON.stringify(new URL(request.url).searchParams),
      'request.headers': JSON.stringify(request.headers),

      // если нашли id - добавляем в теги
      ...(foundId && { 'request.id': foundId }),
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
