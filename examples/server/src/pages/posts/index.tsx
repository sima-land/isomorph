import { configureStore } from '@reduxjs/toolkit';
import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { sauce } from '@sima-land/isomorph/http-client/sauce';
import { PresetHandler } from '@sima-land/isomorph/preset/node/handler';
import { Provider } from 'react-redux';
import { HttpApi } from '../../app/types';
import { PostsPage, PostsSlice } from './parts';
import { TOKEN } from '../../tokens';

export function PostsPageApp() {
  const app = createApplication();

  app.preset(PresetHandler());

  app.bind(TOKEN.Project.Http.api).toProvider(provideHttpApi);
  app.bind(TOKEN.Lib.Http.Handler.Response.Page.prepare).toProvider(provideRender);

  return app;
}

function provideHttpApi(resolve: Resolve): HttpApi {
  const createClient = resolve(TOKEN.Lib.Http.Client.factory);

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

function provideRender(resolve: Resolve) {
  const httpApi = resolve(TOKEN.Project.Http.api);
  const sagaMiddleware = resolve(TOKEN.Lib.sagaMiddleware);

  return async () => {
    const store = configureStore({
      reducer: PostsSlice.reducer,
      middleware: [sagaMiddleware],
    });

    await sagaMiddleware.run(PostsSlice.saga, { api: httpApi });

    return (
      <Provider store={store}>
        <PostsPage />
      </Provider>
    );
  };
}
