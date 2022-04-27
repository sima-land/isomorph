import { RESPONSE_EVENT } from '../constants';
import { propagation, ROOT_CONTEXT } from '@opentelemetry/api';
import type { Tracer } from '../../tracer/types';
import type { Handler } from 'express';

/**
 * Возвращает новый middleware для трассировки стадий входящего запроса.
 * @param tracer Tracer.
 * @return Middleware.
 */
export function tracingMiddleware(tracer: Tracer): Handler {
  return (req, res, next) => {
    const rootContext = propagation.extract(ROOT_CONTEXT, req.headers);
    const rootSpan = tracer.startSpan('response', undefined, rootContext);

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
