---
title: Утилиты для SSR
description: Утилиты для организации серверного рендеринга.
---

# Утилиты для SSR

Пакет предоставляет утилиты для организации серверного рендеринга.

### GlobalDataScript

Компонент для внедрения серверных данных в клиентский JavaScript. Безопасно сериализует данные при помощи [jsesc](https://github.com/mathiasbynens/jsesc).

##### Пример использования:

```tsx
import { Resolve } from '@sima-land/isomorph/di';
import { GlobalDataScript } from '@sima-land/isomorph/utils/ssr';
import { KnownToken } from '@sima-land/isomorph/tokens';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import { TOKEN } from '../../di/tokens';
import { reducer } from '../../reducer';
import { saga } from '../../saga';
import { Component } from '../../../component';

// Провайдер рендеринга верстки
function provideRender(resolve: Resolve) {
  const config = resolve(TOKEN.Server.config);
  const params = resolve(KnownToken.Http.Handler.Request.specificParams);
  const bridge = resolve(KnownToken.SsrBridge.serverSide);
  const logger = resolve(KnownToken.logger);

  return async () => {
    const sagaMiddleware = createSagaMiddleware({ onError: logger.error });
    const store = configureStore({
      reducer,
      middleware: [sagaMiddleware],
    });

    await sagaMiddleware
      .run(saga, {
        params,
        features: config.features,
        timeout: config.ssrTimeout,
      })
      .toPromise();

    return (
      <Provider store={store}>
        <div id={bridge.rootElementId}>
          <Component />
        </div>
        {/** Формируем глобально доступные данные для клиента. */}
        <GlobalDataScript property={bridge.serverDataKey} value={store.getState()} />
      </Provider>
    );
  };
};
```

### SsrBridge

Объект, предоставляющий методы для связывания серверного и клиентского приложений.

##### ```prepare(serviceKey: string)```

> Метод для использования на сервере. Генерирует идентификаторы для корневого элемента и данных.

##### ```resolve<T>(serviceKey: string)```

> Метод для использования на клиенте. Получает корневой элемент и данные, переданные с сервера.

##### Пример использования:

```tsx title="На сервере:"
import { Resolve } from '@sima-land/isomorph/di';
import { PageAssets } from '@sima-land/isomorph/preset/isomorphic';
import { KnownToken } from '@sima-land/isomorph/tokens';
import { GlobalDataScript } from '@sima-land/isomorph/utils/ssr';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';

import { TOKEN } from '../di';
import { reducer } from '../reducer';
import { Component } from '../component';
import { saga } from '../saga';

// Провайдер рендеринга верстки
function provideRender(resolve: Resolve) {
    const api = resolve(TOKEN.api);
    const config = resolve(TOKEN.Server.config);
    const params = resolve(KnownToken.Http.Handler.Request.specificParams);
    const logger = resolve(KnownToken.logger);
    // Формируем серверную часть "моста"
    const bridge = SsrBridge.prepare(config.appName);

    return async () => {
        const store = configureStore({
            reducer,
            middleware: [sagaMiddleware],
        });

        await sagaMiddleware.run(saga, { api, config, params, logger }).toPromise();

        return (
            <Provider store={store}>
            {/** Присваиваем корневому элементу идентификатор rootElementId */}
            <div id={bridge.rootElementId}>
              <Component />
            </div>
            {/** Под ключом serverDataKey формируем глобально доступные данные для клиента */}
            <GlobalDataScript
              property={bridge.serverDataKey}
              value={{
                state: store.getState()
              }}
            />
            </Provider>
        );
    };
}
```
 
```tsx title="На клиенте:"
import { ErrorBoundary } from '@sima-land/isomorph/utils/react';
import { KnownToken } from '@sima-land/isomorph/tokens';

import { Provider } from 'react-redux';
import { hydrateRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import { Component } from './component';
import { RootState, reducer } from './reducer';
import { rootSaga } from './saga';
import { BrowserApp, TOKEN } from './di';

// Браузерное приложение
BrowserApp().invoke([TOKEN.Client.config, KnownToken.logger, TOKEN.api],
    (config, logger, api) => {
        const sagaMiddleware = createSagaMiddleware({ onError: logger.error });
        // Получаем клиентскую часть "моста"
        const ssrBridge = SsrBridge.resolve(config.appName);
        // Извлекаем сервеные данные
        const { state } = ssrBridge.serverSideData as { state: RootState };
        
        const store = configureStore({
            reducer,
            preloadedState: state,
            middleware: [sagaMiddleware],
        });

        sagaMiddleware.run(rootSaga, { api });
        
        hydrateRoot(
            ssrBridge.rootElement, // Элемент, отображенный как корневой на сервере
            <Provider store={store}>
              <ErrorBoundary onError={logger.error} fallback={null}>
                <Component />
              </ErrorBoundary>
            </Provider>,
        );
    },
);
```
