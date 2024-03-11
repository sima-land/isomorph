import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { PresetBunHandler } from '@sima-land/isomorph/preset/bun-handler';
import { TOKEN } from '../../tokens';
import { Layout } from '../../components/Layout';
import { Nav } from '../../components/Nav';
import { createPostApi } from '../../entities/post';

export function PostsPageApp() {
  const app = createApplication();

  // используем пресет "PresetHandler"
  app.preset(
    PresetBunHandler(({ override }) => {
      // переопределяем провайдеры пресета
      override(TOKEN.Lib.Http.Handler.Page.render, provideRender);
    }),
  );

  // добавляем в приложение собственные компоненты
  app.bind(TOKEN.Entities.Post.api).toProvider(providePostApi);

  return app;
}

function provideRender(resolve: Resolve) {
  const api = resolve(TOKEN.Entities.Post.api);

  return async () => {
    const response = await api.getAll();
    const posts = response.ok ? response.data : [];

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

function providePostApi(resolve: Resolve) {
  const fetch = resolve(TOKEN.Lib.Http.fetch);

  return createPostApi({
    host: 'https://jsonplaceholder.typicode.com/',
    fetch,
  });
}
