/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { Middleware, defaultHeaders } from '../../../http';
import { getFetchErrorLogging } from '../../isomorphic/utils/get-fetch-error-logging';
import { getFetchExtraAborting } from '../../isomorphic/utils/get-fetch-extra-aborting';
import { getFetchLogging } from '../../isomorphic/utils/get-fetch-logging';
import { getForwardedHeaders } from '../../server/utils/get-forwarded-headers';

export function provideFetchMiddleware(resolve: Resolve): Middleware[] {
  const config = resolve(KnownToken.Config.base);
  const context = resolve(KnownToken.Http.Handler.context);
  const logHandler = resolve(KnownToken.Http.Fetch.Middleware.Log.handler);
  const abortController = resolve(KnownToken.Http.Fetch.abortController);

  return [
    // ВАЖНО: слой логирования ошибки ПЕРЕД остальными слоями чтобы не упустить ошибки выше
    getFetchErrorLogging(logHandler),

    // обрывание по сигналу из обработчика входящего запроса и по сигналу из конфига исходящего запроса
    getFetchExtraAborting(abortController),

    defaultHeaders(getForwardedHeaders(config, context.request)),

    // @todo tracing

    // ВАЖНО: слой логирования запроса и ответа ПОСЛЕ остальных слоев чтобы использовать актуальные данные
    getFetchLogging(logHandler),
  ];
}
