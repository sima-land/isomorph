import { RESPONSE_EVENT } from '../constants';
import { trace, context } from '@opentelemetry/api';
import type { Tracer } from '../../tracer/types';
import type { Handler } from 'express';

/**
 * Возвращает новый middleware для трассировки стадий входящего запроса.
 * @param tracer Tracer.
 * @return Middleware.
 */
export function tracingMiddleware(tracer: Tracer): Handler {
  return (req, res, next) => {
    const rootSpan = tracer.startSpan('response');
    const rootContext = trace.setSpan(context.active(), rootSpan);

    res.locals.tracing = {
      rootSpan,
      rootContext,
    };

    res.once(RESPONSE_EVENT.renderStart, () => {
      res.locals.tracing.renderSpan = tracer.startSpan('render', undefined, rootContext);
    });

    res.once(RESPONSE_EVENT.renderFinish, () => {
      res.locals.tracing.renderSpan.end();
    });

    res.once('finish', () => {
      rootSpan.end();
    });

    next();
  };
}
