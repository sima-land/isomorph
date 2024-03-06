import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { PresetBun, HandlerProvider } from '@sima-land/isomorph/preset/bun';
import { TOKEN } from '../tokens';
import { PostsPageApp } from '../pages/posts';
import { AuthorsPageApp } from '../pages/authors';
import { ServerHandler } from '@sima-land/isomorph/preset/server';

export function MainApp() {
  const app = createApplication();

  // используем пресет "PresetBun"
  app.preset(
    PresetBun(({ override }) => {
      // переопределяем провайдеры пресета
      override(TOKEN.Lib.Http.Serve.routes, providePageRoutes);
    }),
  );

  // добавляем в приложение собственные компоненты
  app.bind(TOKEN.Pages.posts).toProvider(HandlerProvider(PostsPageApp));
  app.bind(TOKEN.Pages.authors).toProvider(HandlerProvider(AuthorsPageApp));

  return app;
}

function providePageRoutes(resolve: Resolve): Array<[string, ServerHandler]> {
  // определяем маршруты страниц
  return [
    ['/', resolve(TOKEN.Pages.posts)],
    ['/posts', resolve(TOKEN.Pages.posts)],
    ['/authors', resolve(TOKEN.Pages.authors)],
  ];
}
