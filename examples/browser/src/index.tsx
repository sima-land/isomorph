import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ErrorBoundary } from '@sima-land/isomorph/utils/react/error-handlers';
import { ExampleApp } from './di/app';
import { TOKEN } from './di/tokens';
import { KnownToken } from '@sima-land/isomorph/tokens';
import { configureStore } from '@reduxjs/toolkit';
import { Root } from './components/root';
import { rootReducer } from './reducers';
import { rootSaga } from './sagas';

ExampleApp().invoke(
  [TOKEN.config, KnownToken.logger, KnownToken.sagaMiddleware, TOKEN.api],
  (config, logger, sagaMiddleware, api) => {
    const container = document.getElementById(config.appName);

    if (container) {
      const store = configureStore({
        reducer: rootReducer,
        devTools: config.devtoolsEnabled && { name: `${config.appName} [${document.title}]` },
        middleware: [sagaMiddleware],
      });

      render(
        <ErrorBoundary onError={logger.error} fallback={null}>
          <Provider store={store}>
            <Root />
          </Provider>
        </ErrorBoundary>,
        container,
      );

      sagaMiddleware.run(rootSaga, { api });
    }
  },
);
