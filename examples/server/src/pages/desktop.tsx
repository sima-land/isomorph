import React from 'react';
import type { Api } from '../services/api';
import type { SagaExtendedMiddleware } from '@sima-land/isomorph/utils/redux-saga';
import { SsrBridge, GlobalDataScript } from '@sima-land/isomorph/utils/ssr';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { reducer } from '../reducers/app';
import { rootSaga } from '../sagas';
import { DesktopApp } from '../components/desktop';
import { BaseConfig } from '@sima-land/isomorph/config/types';

export async function prepareDesktopPage({
  config,
  api,
  sagaMiddleware,
}: {
  config: BaseConfig;
  api: Api;
  sagaMiddleware: SagaExtendedMiddleware;
}) {
  const store = configureStore({
    reducer,
    middleware: [sagaMiddleware],
  });

  await sagaMiddleware.timeout(3000).run(rootSaga, { api });

  const bridge = SsrBridge.prepare(config.appName);

  return (
    <Provider store={store}>
      <div id={bridge.rootElementId}>
        <DesktopApp />
      </div>
      <GlobalDataScript
        property={bridge.serverDataKey}
        value={{ INITIAL_STATE: store.getState() }}
      />
    </Provider>
  );
}
