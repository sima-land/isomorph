import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ErrorBoundary } from '@sima-land/isomorph/utils/react/error-handlers';
import { ExampleApp } from './app';
import { TOKEN } from './tokens';
import { configureStore } from '@reduxjs/toolkit';
import { Root } from './components/root';
import { rootReducer } from './reducers';
import { rootSaga } from './sagas';

ExampleApp().invoke(
  [TOKEN.Project.config, TOKEN.Lib.logger, TOKEN.Lib.sagaMiddleware, TOKEN.Project.api],
  (config, logger, sagas, api) => {
    const container = document.getElementById(config.appName);

    if (container) {
      const store = configureStore({
        reducer: rootReducer,
        devTools: config.devtoolsEnabled && { name: `${config.appName} [${document.title}]` },
        middleware: [sagas],
      });

      render(
        <ErrorBoundary onError={logger.error} fallback={null}>
          <Provider store={store}>
            <Root />
          </Provider>
        </ErrorBoundary>,
        container,
      );

      sagas.run(rootSaga, { api });
    }
  },
);
