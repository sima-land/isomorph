import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { PresetHandler } from '@sima-land/isomorph/preset/bun';
import { TOKEN } from '../../tokens';
import { Layout } from '../../components/Layout';
import { Nav } from '../../components/Nav';

export function AuthorsPageApp() {
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
    const authors = (await fetch('https://jsonplaceholder.typicode.com/users').then(res =>
      res.json(),
    )) as Array<{ id: number; name: string; username: string }>;

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
