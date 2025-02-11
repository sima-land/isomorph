import type express from 'express';
import type { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { Attributes, ROOT_CONTEXT, propagation, trace } from '@opentelemetry/api';
import { PAGE_HANDLER_EVENT_TYPE } from '../../server';
import {
  ATTR_ERROR_TYPE,
  ATTR_HTTP_REQUEST_HEADER,
  ATTR_HTTP_RESPONSE_BODY_SIZE,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_URL_PATH,
} from '@opentelemetry/semantic-conventions/incubating';

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
  const getConventionalRequestAttrs = (req: express.Request): Attributes => {
    const result: Attributes = {
      [ATTR_URL_PATH]: req.originalUrl,
    };

    for (const headerName in req.headers) {
      if (headerName.toLowerCase().startsWith('simaland-')) {
        result[`${ATTR_HTTP_REQUEST_HEADER(headerName)}`] = req.header(headerName);
      }
    }

    return result;
  };

  return (req, res, next) => {
    const externalContext = propagation.extract(ROOT_CONTEXT, req.headers);
    const rootSpan = tracer.startSpan(`${req.method} ${req.path}`, undefined, externalContext);

    rootSpan.setAttributes(getConventionalRequestAttrs(req));

    const rootContext = trace.setSpan(externalContext, rootSpan);

    res.locals.tracing = {
      rootSpan,
      rootContext,
      renderSpan: null,
    };

    res.once(PAGE_HANDLER_EVENT_TYPE.renderStart, () => {
      res.locals.tracing.renderSpan = tracer.startSpan(
        'react:renderToString',
        undefined,
        rootContext,
      );

      res.once(PAGE_HANDLER_EVENT_TYPE.renderFinish, () => {
        res.locals.tracing.renderSpan.end();
      });
    });

    res.once('finish', () => {
      const contentLength = res.getHeader('content-length') as string;
      rootSpan.setAttributes({
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: String(res.statusCode),
        ...(res.statusCode > 400 && { [ATTR_ERROR_TYPE]: String(res.statusCode) }),
        ...(contentLength && { [ATTR_HTTP_RESPONSE_BODY_SIZE]: contentLength }),
      });
      rootSpan.end();
    });

    next();
  };
}
