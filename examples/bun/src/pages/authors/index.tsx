import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { PresetHandler } from '@sima-land/isomorph/preset/bun';
import { TOKEN } from '../../tokens';
import { Layout } from '../../components/Layout';
import { Nav } from '../../components/Nav';
import { createAuthorApi } from '../../entities/author';

export function AuthorsPageApp() {
  const app = createApplication();

  // используем пресет "PresetHandler"
  app.preset(
    PresetHandler(({ override }) => {
      // переопределяем провайдеры пресета
      override(TOKEN.Lib.Http.Handler.Page.render, provideRender);
    }),
  );

  // добавляем в приложение собственные компоненты
  app.bind(TOKEN.Entities.Author.api).toProvider(provideAuthorApi);

  return app;
}

function provideRender(resolve: Resolve) {
  const api = resolve(TOKEN.Entities.Author.api);

  return async () => {
    const response = await api.getAll();
    const authors = response.ok ? response.data : [];

    return (
      <Layout>
        <h1>Authors</h1>
        <Nav />
        <div>
          {authors.map(item => (
            <article key={item.id}>
              <h3>{item.username}</h3>
              <p>{item.name}</p>
            </article>
          ))}
        </div>
      </Layout>
    );
  };
}

function provideAuthorApi(resolve: Resolve) {
  return createAuthorApi({
    host: 'https://jsonplaceholder.typicode.com/',
    fetch: resolve(TOKEN.Lib.Http.fetch),
  });
}
