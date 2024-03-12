import { Middleware } from 'middleware-axios';
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { HttpStatus } from '../../isomorphic/utils/http-status';
import { axiosTracingMiddleware } from '../../node/utils/axios-tracing-middleware';
import { cookieMiddleware, logMiddleware } from '../../../utils/axios';
import { getForwardedHeaders } from '../../node/utils/get-forwarded-headers';

/**
 * Провайдер фабрики http-клиентов.
 * @param resolve Функция для получения зависимости по токену.
 * @return Фабрика.
 */
export function provideAxiosMiddleware(resolve: Resolve): Middleware<any>[] {
  const appConfig = resolve(KnownToken.Config.base);
  const tracer = resolve(KnownToken.Tracing.tracer);
  const context = resolve(KnownToken.ExpressHandler.context);
  const logHandler = resolve(KnownToken.Axios.Middleware.Log.handler);
  const cookieStore = resolve(KnownToken.Http.Fetch.cookieStore);
  const abortController = resolve(KnownToken.Http.Fetch.abortController);

  return [
    // пробрасываемые заголовки по соглашению
    async (config, next) => {
      await next({
        ...config,
        headers: {
          ...getForwardedHeaders(appConfig, context.req),

          // ВАЖНО: заголовки из конфига важнее, поэтому идут в конце
          ...config.headers,
        },
      });
    },

    // обрывание по сигналу из обработчика входящего запроса и по сигналу из конфига исходящего запроса
    async (config, next) => {
      const innerController = new AbortController();

      abortController.signal.addEventListener(
        'abort',
        () => {
          innerController.abort();
        },
        { once: true },
      );

      config.signal?.addEventListener?.(
        'abort',
        () => {
          innerController.abort();
        },
        { once: true },
      );

      await next({ ...config, signal: innerController.signal });
    },

    HttpStatus.axiosMiddleware(),
    axiosTracingMiddleware(tracer, context.res.locals.tracing.rootContext),
    logMiddleware(logHandler),
    cookieMiddleware(cookieStore),
  ];
}
