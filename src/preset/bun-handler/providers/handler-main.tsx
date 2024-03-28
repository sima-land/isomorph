/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { applyMiddleware } from '../../../http';
import { HelmetContext } from '../../server/utils/regular-helmet';
import { formatHandlerError } from '../../server/utils/format-handler-error';

export function provideHandlerMain(resolve: Resolve) {
  const config = resolve(KnownToken.Config.base);
  const logger = resolve(KnownToken.logger);
  const assetsInit = resolve(KnownToken.Http.Handler.Page.assets);
  const render = resolve(KnownToken.Http.Handler.Page.render);
  const Helmet = resolve(KnownToken.Http.Handler.Page.helmet);
  const abortController = resolve(KnownToken.Http.Fetch.abortController);
  const formatResponse = resolve(KnownToken.Http.Handler.Page.formatResponse);

  const getAssets = typeof assetsInit === 'function' ? assetsInit : () => assetsInit;

  const handler = async (): Promise<Response> => {
    try {
      const assets = await getAssets();

      const jsx = (
        <HelmetContext.Provider value={{ title: config.appName, assets }}>
          <Helmet>{await render()}</Helmet>
        </HelmetContext.Provider>
      );

      const { body, headers } = await formatResponse(jsx, assets);

      return new Response(body, { headers });
    } catch (error) {
      const { response, log } = formatHandlerError(error);

      if (log.level && logger[log.level]) {
        logger[log.level](error);
      }

      if (response.status > 299 && response.status < 400 && response.redirectLocation) {
        return new Response(null, {
          status: response.status,
          headers: {
            Location: response.redirectLocation,
          },
        });
      } else {
        return new Response(response.body, {
          status: response.status,
        });
      }
    }
  };

  const enhancer = applyMiddleware(
    // ВАЖНО: прерываем исходящие в рамках обработчика http-запросы
    async (request, next) => {
      const response = await next(request);

      abortController.abort();

      return response;
    },
  );

  return enhancer(handler);
}
