import type { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { HelmetContext } from '../../server/utils/regular-helmet';
import { ResponseError } from '../../../http';
import { LogLevel } from '../../../log';

/**
 * Провайдер главной функции обработчика входящего http-запроса.
 * @param resolve Функция для получения зависимости по токену.
 * @return Главная функция.
 */
export function provideHandlerMain(resolve: Resolve): VoidFunction {
  const config = resolve(KnownToken.Config.base);
  const logger = resolve(KnownToken.logger);
  const context = resolve(KnownToken.ExpressHandler.context);
  const render = resolve(KnownToken.Http.Handler.Page.render);
  const assetsInit = resolve(KnownToken.Http.Handler.Page.assets);
  const extras = resolve(KnownToken.Http.Handler.Response.specificExtras);
  const Helmet = resolve(KnownToken.Http.Handler.Page.helmet);
  const abortController = resolve(KnownToken.Http.Fetch.abortController);
  const format = resolve(KnownToken.Http.Handler.Page.formatResponse);

  const getAssets = typeof assetsInit === 'function' ? assetsInit : () => assetsInit;

  // @todo https://github.com/sima-land/isomorph/issues/69
  // const cookieStore = resolve(KnownToken.Http.Fetch.cookieStore);
  // cookieStore.subscribe(setCookieList => {
  //   for (const setCookie of setCookieList) {
  //     const parsed = parseSetCookieHeader(setCookie);

  //     parsed && res.cookie(parsed.name, parsed.value, parsed.attrs);
  //   }
  // });

  return async () => {
    try {
      const assets = await getAssets();
      const meta = extras.getMeta();

      const { body, headers } = await format(
        <HelmetContext.Provider value={{ title: config.appName, assets }}>
          <Helmet>{await render()}</Helmet>
        </HelmetContext.Provider>,
        assets,
        meta,
      );

      headers.forEach((hValue, hName) => context.res.setHeader(hName, hValue));
      context.res.send(body);
    } catch (error) {
      let logLevel: LogLevel | null = 'error';
      let message: string;
      let statusCode = 500; // по умолчанию, если на этапе подготовки страницы что-то не так, отдаем 500
      let redirectLocation: string | null = null;

      if (error instanceof Error) {
        message = error.message;

        if (error instanceof ResponseError) {
          statusCode = error.statusCode;
          redirectLocation = error.redirectLocation;
          logLevel = error.logLevel;
        }
      } else {
        message = String(error);
      }

      if (statusCode > 299 && statusCode < 400 && redirectLocation) {
        context.res.redirect(statusCode, redirectLocation);
      } else {
        context.res.status(statusCode).send(message);
      }

      if (logLevel && logger[logLevel]) {
        logger[logLevel](error);
      }
    }

    // ВАЖНО: прерываем исходящие в рамках обработчика http-запросы
    abortController.abort();
  };
}

// @todo а что если привести все зависимости к виду:
// const getAppConfig = resolve.lazy(KnownToken.Config.base);
