import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ErrorBoundary } from '@sima-land/isomorph/utils/react';
import { ExampleApp } from './app';
import { TOKEN } from './tokens';
import { configureStore } from '@reduxjs/toolkit';
import { Root } from './components/root';
import { rootReducer } from './reducers';
import { rootSaga } from './sagas';

ExampleApp().invoke(
  [TOKEN.Project.config, TOKEN.Lib.logger, TOKEN.Lib.Redux.Middleware.saga, TOKEN.Project.api],
  (config, logger, sagas, api) => {
    const container = document.getElementById(config.appName);

    if (container) {
      const store = configureStore({
        reducer: rootReducer,
        devTools: config.devtoolsEnabled && { name: `${config.appName} [${document.title}]` },
        middleware: [sagas],
      });

      createRoot(container).render(
        <ErrorBoundary onError={logger.error} fallback={null}>
          <Provider store={store}>
            <Root />
          </Provider>
        </ErrorBoundary>,
      );

      sagas.run(rootSaga, { api });
    }
  },
);
