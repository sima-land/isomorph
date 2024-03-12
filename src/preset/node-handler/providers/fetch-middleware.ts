import { Resolve } from '../../../di';
import { Middleware, cookie, defaultHeaders } from '../../../http';
import { KnownToken } from '../../../tokens';
import { getFetchErrorLogging } from '../../isomorphic/utils/get-fetch-error-logging';
import { getFetchExtraAborting } from '../../isomorphic/utils/get-fetch-extra-aborting';
import { getFetchLogging } from '../../isomorphic/utils/get-fetch-logging';
import { getFetchTracing } from '../../server/utils/get-fetch-tracing';
import { getForwardedHeaders } from '../../node/utils/get-forwarded-headers';

/**
 * Провайдер промежуточных слоев для fetch.
 * @param resolve Функция для получения зависимости по токену.
 * @return Массив промежуточных слоев.
 */
export function provideFetchMiddleware(resolve: Resolve): Middleware[] {
  const config = resolve(KnownToken.Config.base);
  const tracer = resolve(KnownToken.Tracing.tracer);
  const context = resolve(KnownToken.ExpressHandler.context);
  const logHandler = resolve(KnownToken.Http.Fetch.Middleware.Log.handler);
  const cookieStore = resolve(KnownToken.Http.Fetch.cookieStore);
  const abortController = resolve(KnownToken.Http.Fetch.abortController);

  return [
    // ВАЖНО: слой логирования ошибки ПЕРЕД остальными слоями чтобы не упустить ошибки выше
    getFetchErrorLogging(logHandler),

    // пробрасываемые заголовки по соглашению
    defaultHeaders(getForwardedHeaders(config, context.req)),

    // обрывание по сигналу из обработчика входящего запроса и по сигналу из конфига исходящего запроса
    getFetchExtraAborting(abortController),

    cookie(cookieStore),

    getFetchTracing(tracer, context.res.locals.tracing.rootContext),

    // ВАЖНО: слой логирования запроса и ответа ПОСЛЕ остальных слоев чтобы использовать актуальные данные
    getFetchLogging(logHandler),
  ];
}
