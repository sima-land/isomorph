import { RESPONSE_EVENT } from '../constants';
import { propagation, ROOT_CONTEXT, trace, Tracer } from '@opentelemetry/api';
import type { Request, Handler } from 'express';

/**
 * Возвращает новый middleware для трассировки стадий входящего запроса.
 * @param tracer Tracer.
 * @return Middleware.
 */
export function tracingMiddleware(tracer: Tracer): Handler {
  return (req, res, next) => {
    const externalContext = propagation.extract(ROOT_CONTEXT, req.headers);
    const rootSpan = tracer.startSpan('response', undefined, externalContext);

    rootSpan.setAttributes(getConventionalRequestAttrs(req));

    const rootContext = trace.setSpan(externalContext, rootSpan);

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

/**
 * Возвращает набор стандартных атрибутов для спана.
 * @param req Входящий http-запрос.
 * @return Атрибуты.
 */
export function getConventionalRequestAttrs(req: Request): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {
    'request.path': req.originalUrl,
  };

  for (const headerName in req.headers) {
    if (headerName.toLowerCase().startsWith('simaland-')) {
      result[headerName] = req.header(headerName);
    }
  }

  return result;
}