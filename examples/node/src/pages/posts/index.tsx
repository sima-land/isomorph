import { configureStore } from '@reduxjs/toolkit';
import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { sauce } from '@sima-land/isomorph/utils/axios';
import { PresetHandler } from '@sima-land/isomorph/preset/node';
import { Provider } from 'react-redux';
import { HttpApi } from '../../app/types';
import { PostsPage, PostsSlice } from './parts';
import { TOKEN } from '../../tokens';

export function PostsPageApp() {
  const app = createApplication();

  // используем пресет "PresetHandler"
  app.preset(
    // переопределяем провайдеры пресета
    PresetHandler(({ override }) => {
      override(TOKEN.Lib.Http.Handler.Page.render, provideRender);
    }),
  );

  // добавляем в приложение собственные компоненты
  app.bind(TOKEN.Project.Http.api).toProvider(provideHttpApi);

  return app;
}

function provideRender(resolve: Resolve) {
  const httpApi = resolve(TOKEN.Project.Http.api);
  const sagaMiddleware = resolve(TOKEN.Lib.Redux.Middleware.saga);

  return async () => {
    const store = configureStore({
      reducer: PostsSlice.reducer,
      middleware: [sagaMiddleware],
    });

    await sagaMiddleware.run(PostsSlice.saga, { api: httpApi }).toPromise();

    return (
      <Provider store={store}>
        <PostsPage />
      </Provider>
    );
  };
}

function provideHttpApi(resolve: Resolve): HttpApi {
  const createClient = resolve(TOKEN.Lib.Axios.factory);

  const client = sauce(createClient({ baseURL: 'https://jsonplaceholder.typicode.com/' }));

  return {
    getPosts() {
      return client.get('posts/');
    },
    getUsers() {
      return client.get('users/');
    },
  };
}
