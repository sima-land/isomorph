import type { Resolve } from '../../../di';
import type express from 'express';
import { KnownToken } from '../../../tokens';
import { HelmetContext } from '../../server/utils/regular-helmet';
import { formatHandlerError } from '../../server/utils/format-handler-error';

/**
 * Провайдер главной функции обработчика входящего http-запроса.
 * @param resolve Функция для получения зависимости по токену.
 * @return Главная функция.
 */
export function provideHandlerMain(resolve: Resolve): express.Handler {
  const config = resolve(KnownToken.Config.base);
  const logger = resolve(KnownToken.logger);
  const context = resolve(KnownToken.ExpressHandler.context);
  const render = resolve(KnownToken.Http.Handler.Page.render);
  const assetsInit = resolve(KnownToken.Http.Handler.Page.assets);
  const Helmet = resolve(KnownToken.Http.Handler.Page.helmet);
  const abortController = resolve(KnownToken.Http.Fetch.abortController);
  const formatResponse = resolve(KnownToken.Http.Handler.Page.formatResponse);

  const getAssets = typeof assetsInit === 'function' ? assetsInit : () => assetsInit;

  return async () => {
    try {
      const assets = await getAssets();

      const jsx = (
        <HelmetContext.Provider value={{ title: config.appName, assets }}>
          <Helmet>{await render()}</Helmet>
        </HelmetContext.Provider>
      );

      const { body, headers } = await formatResponse(jsx, assets);

      headers.forEach((hValue, hName) => context.res.setHeader(hName, hValue));
      context.res.send(body);
    } catch (error) {
      const { response, log } = formatHandlerError(error);

      if (response.status > 299 && response.status < 400 && response.redirectLocation) {
        context.res.redirect(response.status, response.redirectLocation);
      } else {
        context.res.status(response.status).send(response.body);
      }

      if (log.level && logger[log.level]) {
        logger[log.level](error);
      }
    }

    // ВАЖНО: прерываем исходящие в рамках обработчика http-запросы
    abortController.abort();
  };
}

// @todo а что если привести все зависимости к виду:
// const getAppConfig = resolve.lazy(KnownToken.Config.base);
