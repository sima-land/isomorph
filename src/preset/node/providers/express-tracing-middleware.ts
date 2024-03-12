import type express from 'express';
import type { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { ROOT_CONTEXT, propagation, trace } from '@opentelemetry/api';
import { PAGE_HANDLER_EVENT_TYPE } from '../../server';

/**
 * Провайдер промежуточного слоя трассировки входящих http-запросов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Промежуточный слой.
 */
export function provideExpressTracingMiddleware(resolve: Resolve): express.Handler {
  const tracer = resolve(KnownToken.Tracing.tracer);

  /**
   * Возвращает набор стандартных атрибутов для спана.
   * @param req Входящий http-запрос.
   * @return Атрибуты.
   */
  const getConventionalRequestAttrs = (
    req: express.Request,
  ): Record<string, string | undefined> => {
    const result: Record<string, string | undefined> = {
      'request.path': req.originalUrl,
    };

    for (const headerName in req.headers) {
      if (headerName.toLowerCase().startsWith('simaland-')) {
        result[headerName] = req.header(headerName);
      }
    }

    return result;
  };

  return (req, res, next) => {
    const externalContext = propagation.extract(ROOT_CONTEXT, req.headers);
    const rootSpan = tracer.startSpan('response', undefined, externalContext);

    rootSpan.setAttributes(getConventionalRequestAttrs(req));

    const rootContext = trace.setSpan(externalContext, rootSpan);

    res.locals.tracing = {
      rootSpan,
      rootContext,
      renderSpan: null,
    };

    res.once(PAGE_HANDLER_EVENT_TYPE.renderStart, () => {
      res.locals.tracing.renderSpan = tracer.startSpan('render', undefined, rootContext);

      res.once(PAGE_HANDLER_EVENT_TYPE.renderFinish, () => {
        res.locals.tracing.renderSpan.end();
      });
    });

    res.once('finish', () => {
      rootSpan.end();
    });

    next();
  };
}
