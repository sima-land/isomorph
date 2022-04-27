import React from 'react';
import type { Api } from '../services/api';
import type { SagaRunner } from '@sima-land/isomorph/saga-runner/types';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { reducer } from '../reducers/app';
import { rootSaga } from '../sagas';
import { DesktopApp } from '../components/desktop';

export async function prepareDesktopPage({
  api,
  sagaRunner,
}: {
  api: Api;
  sagaRunner: SagaRunner;
}) {
  const store = configureStore({
    reducer,
    middleware: [sagaRunner.middleware],
  });

  await sagaRunner.prepare(store, { timeout: 3000 }).run(rootSaga, { api });

  return (
    <Provider store={store}>
      <DesktopApp />
    </Provider>
  );
}
