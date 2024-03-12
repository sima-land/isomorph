import type { Resolve } from '../../../di';
import { KnownToken } from '../../../tokens';
import { renderToString } from 'react-dom/server';
import { PAGE_HANDLER_EVENT_TYPE } from '../../server';
import { HelmetContext } from '../../server/utils/regular-helmet';
import { getPageResponseFormat } from '../../node/utils/get-page-response-format';
import { ConventionalJson } from '../../isomorphic';
import { ResponseError } from '../../../http';

/**
 * Провайдер главной функции обработчика входящего http-запроса.
 * @param resolve Функция для получения зависимости по токену.
 * @return Главная функция.
 */
export function provideHandlerMain(resolve: Resolve): VoidFunction {
  const config = resolve(KnownToken.Config.base);
  const logger = resolve(KnownToken.logger);
  const assetsInit = resolve(KnownToken.Http.Handler.Page.assets);
  const render = resolve(KnownToken.Http.Handler.Page.render);
  const extras = resolve(KnownToken.Http.Handler.Response.specificExtras);
  const Helmet = resolve(KnownToken.Http.Handler.Page.helmet);
  const { req, res } = resolve(KnownToken.ExpressHandler.context);
  const abortController = resolve(KnownToken.Http.Fetch.abortController);

  const getAssets = typeof assetsInit === 'function' ? assetsInit : () => assetsInit;

  /**
   * Рендер JSX-элемента в строку.
   * @param element Элемент.
   * @return Строка.
   */
  const elementToString = (element: JSX.Element) => {
    res.emit(PAGE_HANDLER_EVENT_TYPE.renderStart);
    const result = renderToString(element);
    res.emit(PAGE_HANDLER_EVENT_TYPE.renderFinish);

    return result;
  };

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

      const jsx = (
        <HelmetContext.Provider value={{ title: config.appName, assets }}>
          <Helmet>{await render()}</Helmet>
        </HelmetContext.Provider>
      );

      switch (getPageResponseFormat(req)) {
        case 'html': {
          res.setHeader('simaland-bundle-js', assets.js);
          res.setHeader('simaland-bundle-css', assets.css);

          if (assets.criticalJs) {
            res.setHeader('simaland-critical-js', assets.criticalJs);
          }

          if (assets.criticalCss) {
            res.setHeader('simaland-critical-css', assets.criticalCss);
          }

          if (meta) {
            res.setHeader('simaland-meta', JSON.stringify(meta));
          }

          // ВАЖНО: DOCTYPE обязательно нужен так как влияет на то как браузер будет парсить html/css
          // ВАЖНО: DOCTYPE нужен только когда отдаем полноценную страницу
          if (config.env === 'development') {
            res.send(`<!DOCTYPE html>${elementToString(jsx)}`);
          } else {
            res.send(elementToString(jsx));
          }
          break;
        }

        case 'json': {
          res.json({
            markup: elementToString(jsx),
            bundle_js: assets.js,
            bundle_css: assets.css,
            critical_js: assets.criticalJs,
            critical_css: assets.criticalCss,
            meta,
          } satisfies ConventionalJson);
          break;
        }
      }
    } catch (error) {
      let message: string;
      let statusCode = 500; // по умолчанию, если на этапе подготовки страницы что-то не так, отдаем 500

      if (error instanceof Error) {
        message = error.message;

        if (error instanceof ResponseError) {
          statusCode = error.statusCode;
        }
      } else {
        message = String(error);
      }

      res.status(statusCode).send(message);
      logger.error(error);
    }

    // ВАЖНО: прерываем исходящие в рамках обработчика http-запросы
    abortController.abort();
  };
}

// @todo а что если привести все зависимости к виду:
// const getAppConfig = resolve.lazy(KnownToken.Config.base);
