import { ReactNode, createContext, useContext } from 'react';
import { PageAssets } from '../../../isomorphic/types';
import { Handler, Request } from 'express';
import { Application, CURRENT_APP, Resolve } from '../../../../di';
import { KnownToken } from '../../../../tokens';

export const HelmetContext = createContext<{ title?: string; assets?: PageAssets }>({});

const resetCSS = `
* {
  box-sizing: border-box;
}
body {
  font-family: -apple-system,BlinkMacSystemFont,'Source Sans Pro',"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,Arial,sans-serif;
  margin: 0;
}
`;

/**
 * Простой Helmet-компонент.
 * Выведет html, head и body.
 * @param props Свойства.
 * @return Элемент.
 */
export function RegularHelmet({ children }: { children?: ReactNode }) {
  const { title, assets } = useContext(HelmetContext);

  return (
    <html>
      <head>
        <meta charSet='UTF-8' />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>{title ?? 'Document'}</title>
        <link
          href='https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700;1,900&amp;display=swap'
          rel='stylesheet'
        />
        <style dangerouslySetInnerHTML={{ __html: resetCSS }} />

        {assets?.criticalCss && <link rel='stylesheet' href={assets.criticalCss} />}
        {assets?.css && <link rel='stylesheet' href={assets.css} />}
        {assets?.criticalJs && <script src={assets.criticalJs} />}
      </head>
      <body>
        {children}
        {assets?.js && <script src={assets.js} />}
      </body>
    </html>
  );
}

/**
 * Специфичные для наших микросервисов дополнительные данные ответа.
 */
export class SpecificExtras {
  private _meta: any;

  /**
   * Установит мета-данные.
   * @param meta Данные.
   * @return Контекст.
   */
  setMeta(meta: any): this {
    this._meta = meta;
    return this;
  }

  /**
   * Вернет установленные мета-данные.
   * @return Данные.
   */
  getMeta(): unknown {
    return this._meta;
  }
}

/**
 * Определит формат ответа.
 * @param req Запрос.
 * @return Формат.
 */
export function getPageResponseFormat(req: Request): 'html' | 'json' {
  let result: 'html' | 'json' = 'html';

  if ((req.header('accept') || '').toLowerCase().includes('application/json')) {
    result = 'json';
  }

  return result;
}

/**
 * Возвращает express-handler, создающий дочернее di-приложение при запросе.
 * @param getApp Должна вернуть di-приложения запроса.
 * @return Обработчик.
 */
export function HandlerProvider(getApp: () => Application) {
  return (resolve: Resolve): Handler => {
    const parent = resolve(CURRENT_APP);

    return (req, res, next) => {
      const app = getApp();

      app.attach(parent);
      app.bind(KnownToken.ExpressHandler.context).toValue({ req, res, next });
      app.get(KnownToken.ExpressHandler.main)();
    };
  };
}
