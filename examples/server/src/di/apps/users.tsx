import { configureStore } from '@reduxjs/toolkit';
import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { sauce } from '@sima-land/isomorph/http-client/sauce';
import { PresetHandler } from '@sima-land/isomorph/preset/node/handler';
import { Provider } from 'react-redux';
import { HttpApi } from '../../app';
import { UsersPage, reducer, saga } from '../../pages/users';
import { TOKEN } from '../tokens';

export function UsersHandler() {
  const app = createApplication();

  app.preset(PresetHandler());

  app.bind(TOKEN.httpApi).toProvider(provideHttpApi);
  app.bind(TOKEN.Known.Http.Handler.Response.Page.prepare).toProvider(providePagePrepare);

  return app;
}

function provideHttpApi(resolve: Resolve): HttpApi {
  const createClient = resolve(TOKEN.Known.Http.Client.factory);

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

function providePagePrepare(resolve: Resolve) {
  const httpApi = resolve(TOKEN.httpApi);
  const sagaMiddleware = resolve(TOKEN.Known.sagaMiddleware);

  return async () => {
    const store = configureStore({
      reducer,
      middleware: [sagaMiddleware],
    });

    await sagaMiddleware.run(saga, { api: httpApi });

    return (
      <Provider store={store}>
        <UsersPage />
      </Provider>
    );
  };
}
