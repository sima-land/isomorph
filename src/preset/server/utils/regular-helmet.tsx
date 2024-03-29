import { ReactNode, createContext, useContext } from 'react';
import { PageAssets } from '../../isomorphic/types';

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
 * Простой Helmet-компонент. Выведет html, head и body.
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
