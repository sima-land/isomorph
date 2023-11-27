import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { PresetBun, HandlerProvider } from '@sima-land/isomorph/preset/bun';
import { TOKEN } from '../tokens';
import { PostsPageApp } from '../pages/posts';
import { AuthorsPageApp } from '../pages/authors';

export function MainApp() {
  const app = createApplication();

  // используем пресет "PresetBun"
  app.preset(
    PresetBun(({ override }) => {
      // переопределяем провайдеры пресета
      override(TOKEN.Lib.Http.Serve.routes, provideRoutes);
    }),
  );

  // добавляем в приложение собственные компоненты
  app.bind(TOKEN.Pages.posts).toProvider(HandlerProvider(PostsPageApp));
  app.bind(TOKEN.Pages.authors).toProvider(HandlerProvider(AuthorsPageApp));

  return app;
}

function provideRoutes(resolve: Resolve) {
  return [
    ['/', resolve(TOKEN.Pages.posts)],
    ['/posts', resolve(TOKEN.Pages.posts)],
    ['/authors', resolve(TOKEN.Pages.authors)],
  ];
}
