import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { PresetBun, HandlerProvider } from '@sima-land/isomorph/preset/bun';
import { TOKEN } from '../tokens';
import { PostsPageApp } from '../pages/posts';
import { AuthorsPageApp } from '../pages/authors';

export function MainApp() {
  const app = createApplication();

  app.preset(
    PresetBun(({ override }) => {
      override(TOKEN.Lib.Http.Serve.routes, provideRoutes);
    }),
  );

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
