/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { ResponseError, applyMiddleware } from '../../../http';
import { HelmetContext } from '../../server/utils/regular-helmet';
import { LogLevel } from '../../../log';

export function provideHandlerMain(resolve: Resolve) {
  const config = resolve(KnownToken.Config.base);
  const logger = resolve(KnownToken.logger);
  const assetsInit = resolve(KnownToken.Http.Handler.Page.assets);
  const render = resolve(KnownToken.Http.Handler.Page.render);
  const extras = resolve(KnownToken.Http.Handler.Response.specificExtras);
  const Helmet = resolve(KnownToken.Http.Handler.Page.helmet);
  const abortController = resolve(KnownToken.Http.Fetch.abortController);
  const formatResponse = resolve(KnownToken.Http.Handler.Page.formatResponse);

  // @todo https://github.com/sima-land/isomorph/issues/69
  // const cookieStore = resolve(KnownToken.Http.Fetch.cookieStore);
  // const forwardedSetCookie: string[] = [];
  // const unsubscribeCookieStore = cookieStore.subscribe(setCookieList => {
  //   forwardedSetCookie.push(...setCookieList);
  // });

  const getAssets = typeof assetsInit === 'function' ? assetsInit : () => assetsInit;

  const handler = async (): Promise<Response> => {
    try {
      const assets = await getAssets();
      const meta = extras.getMeta();

      const jsx = (
        <HelmetContext.Provider value={{ title: config.appName, assets }}>
          <Helmet>{await render()}</Helmet>
        </HelmetContext.Provider>
      );

      const { body, headers } = await formatResponse(jsx, assets, meta);

      return new Response(body, { headers });
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

      if (logLevel && logger[logLevel]) {
        logger[logLevel](error);
      }

      if (statusCode > 299 && statusCode < 400 && redirectLocation) {
        return new Response(null, {
          status: statusCode,
          headers: {
            Location: redirectLocation,
          },
        });
      } else {
        return new Response(message, {
          status: statusCode,
        });
      }
    }
  };

  const enhancer = applyMiddleware(
    // @todo https://github.com/sima-land/isomorph/issues/69
    // async (request, next) => {
    //   const response = await next(request);
    //   for (const item of forwardedSetCookie) {
    //     response.headers.append('set-cookie', item);
    //   }
    //   unsubscribeCookieStore();
    //   return response;
    // },

    // ВАЖНО: прерываем исходящие в рамках обработчика http-запросы
    async (request, next) => {
      const response = await next(request);

      abortController.abort();

      return response;
    },
  );

  return enhancer(handler);
}
