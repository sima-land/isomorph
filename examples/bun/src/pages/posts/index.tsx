import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { PresetHandler } from '@sima-land/isomorph/preset/bun';
import { TOKEN } from '../../tokens';
import { Layout } from '../../components/Layout';
import { Nav } from '../../components/Nav';

export function PostsPageApp() {
  const app = createApplication();

  // используем пресет "PresetHandler"
  app.preset(
    PresetHandler(({ override }) => {
      // переопределяем провайдеры пресета
      override(TOKEN.Lib.Http.Handler.Page.render, provideRender);
    }),
  );

  return app;
}

function provideRender(resolve: Resolve) {
  const fetch = resolve(TOKEN.Lib.Http.fetch);

  return async () => {
    const posts = (await fetch('https://jsonplaceholder.typicode.com/posts').then(res =>
      res.json(),
    )) as Array<{ id: number; title: string; body: string }>;

    return (
      <Layout>
        <h1>Posts</h1>
        <Nav />
        <div>
          {posts.map(item => (
            <article key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </Layout>
    );
  };
}
