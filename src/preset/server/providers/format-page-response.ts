import type { Resolve } from '../../../di';
import type { ConventionalJson } from '../../isomorphic';
import type { PageResponseFormatter } from '../types';
import { KnownToken } from '../../../tokens';
import { PAGE_FORMAT_PRIORITY } from '../constants';

/**
 * Провайдер функции форматирования ответа.
 * Функция форматирования вернёт данные ответа на запрос страницы в нужном формате в зависимости от заголовка Accept.
 * @param resolve Резолвер.
 * @return Функция форматирования.
 */
export function provideFormatPageResponse(resolve: Resolve): PageResponseFormatter {
  const config = resolve(KnownToken.Config.base);
  const acceptType = resolve(KnownToken.Http.Handler.Request.acceptType);
  const elementToString = resolve(KnownToken.Http.Handler.Page.elementToString);

  return async (jsx, assets, meta) => {
    const headers = new Headers();
    let body: string;

    switch (acceptType(PAGE_FORMAT_PRIORITY)) {
      case 'json': {
        headers.set('content-type', 'application/json');

        body = JSON.stringify({
          markup: await elementToString(jsx),
          bundle_js: assets.js,
          bundle_css: assets.css,
          critical_js: assets.criticalJs,
          critical_css: assets.criticalCss,
          meta,
        } satisfies ConventionalJson);

        break;
      }

      case 'html':
      default: {
        headers.set('content-type', 'text/html');
        headers.set('simaland-bundle-js', assets.js);
        headers.set('simaland-bundle-css', assets.css);

        if (assets.criticalJs) {
          headers.set('simaland-critical-js', assets.criticalJs);
        }

        if (assets.criticalCss) {
          headers.set('simaland-critical-css', assets.criticalCss);
        }

        if (meta) {
          headers.set('simaland-meta', JSON.stringify(meta));
        }

        // ВАЖНО: DOCTYPE обязательно нужен так как влияет на то как браузер будет парсить html/css
        // ВАЖНО: DOCTYPE нужен только когда отдаем полноценную страницу
        if (config.env === 'development') {
          body = `<!DOCTYPE html>${await elementToString(jsx)}`;
        } else {
          body = await elementToString(jsx);
        }

        break;
      }
    }

    return { body, headers };
  };
}
