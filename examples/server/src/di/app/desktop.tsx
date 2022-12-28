import type { PageAssets } from '@sima-land/isomorph/http-server/types';
import { createApplication, Resolve } from '@sima-land/isomorph/di';
import { PresetResponse } from '@sima-land/isomorph/preset/node/response';
import { KnownToken } from '@sima-land/isomorph/tokens';
import { TOKEN } from '../tokens';
import { Api } from '../../types';
import { sauce } from '@sima-land/isomorph/http-client/sauce';
import { Provider } from 'react-redux';
import { GlobalDataScript } from '@sima-land/isomorph/utils/ssr';
import { DesktopApp as Desktop } from '../../components/desktop';
import { reducer } from '../../reducers/app';
import { configureStore } from '@reduxjs/toolkit';
import { rootSaga } from '../../sagas';

export function DesktopApp() {
  const app = createApplication();

  app.preset(PresetResponse());

  app.bind(TOKEN.Response.api).toProvider(provideApi);
  app.bind(KnownToken.Response.assets).toProvider(provideAssets);
  app.bind(KnownToken.Response.prepare).toProvider(providePrepare);

  return app;
}

function provideApi(resolve: Resolve): Api {
  const knownHosts = resolve(KnownToken.Http.Api.knownHosts);
  const createClient = resolve(KnownToken.Http.Client.factory);
  const client = sauce(createClient({ baseURL: knownHosts.get('simaV3') }));

  return {
    getCurrencies() {
      return client.get('currency/');
    },
    getUser() {
      return client.get('user/');
    },
  };
}

function provideAssets(): PageAssets {
  return {
    js: '',
    css: 'index.css',
  };
}

function providePrepare(resolve: Resolve): () => Promise<JSX.Element> {
  const api = resolve(TOKEN.Response.api);
  const sagaMiddleware = resolve(KnownToken.sagaMiddleware);
  const bridge = resolve(KnownToken.SsrBridge.serverSide);
  const builder = resolve(KnownToken.Response.builder);

  return async function prepare() {
    const store = configureStore({
      reducer,
      middleware: [sagaMiddleware],
    });

    await sagaMiddleware.timeout(3000).run(rootSaga, { api });

    // пример установки meta-данных в ответ
    builder.meta(JSON.stringify({ userId: store.getState().user?.data?.id }));

    return (
      <Provider store={store}>
        <div id={bridge.rootElementId}>
          <Desktop />
        </div>
        <GlobalDataScript
          property={bridge.serverDataKey}
          value={{ INITIAL_STATE: store.getState() }}
        />
      </Provider>
    );
  };
}
