import { TOKEN } from '../tokens';
import { AppConfig } from './types';
import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { PresetNode, HandlerProvider } from '@sima-land/isomorph/preset/node';
import { AuthorsPageApp } from '../pages/authors';
import { PostsPageApp } from '../pages/posts';
import { Handler } from 'express';

export function MainApp() {
  const app = createApplication();

  // используем пресет "node" с базовыми компонентами, такими как logger и тд
  app.preset(
    PresetNode(({ override }) => {
      // переопределяем компонент маршрутов
      override(TOKEN.Lib.Express.pageRoutes, providePageRoutes);

      // добавляем проксирование
      override(TOKEN.Lib.Http.Serve.Proxy.config, () => ({
        filter: '/api',
        target: 'https://jsonplaceholder.typicode.com/',
        pathRewrite: pathname => pathname.replace('/api', ''),
      }));
    }),
  );

  // добавляем в приложение собственные компоненты
  app.bind(TOKEN.config).toProvider(provideAppConfig);
  app.bind(TOKEN.Pages.posts).toProvider(HandlerProvider(PostsPageApp));
  app.bind(TOKEN.Pages.authors).toProvider(HandlerProvider(AuthorsPageApp));

  return app;
}

function provideAppConfig(resolve: Resolve): AppConfig {
  const source = resolve(TOKEN.Lib.Config.source);
  const base = resolve(TOKEN.Lib.Config.base);

  return {
    ...base,
    http: {
      ports: {
        main: Number(source.require('MAIN_HTTP_PORT')) || -1,
        metrics: Number(source.require('METRICS_HTTP_PORT')) || -1,
      },
    },
  };
}

function providePageRoutes(resolve: Resolve): Array<[string, Handler]> {
  // определяем маршруты страниц
  return [
    ['/', resolve(TOKEN.Pages.posts)],
    ['/posts', resolve(TOKEN.Pages.posts)],
    ['/authors', resolve(TOKEN.Pages.authors)],
  ];
}
