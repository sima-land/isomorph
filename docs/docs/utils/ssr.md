---
title: Утилиты для SSR
description: Утилиты для организации серверного рендеринга.
---

# Утилиты для SSR

Пакет предоставляет утилиты для организации серверного рендеринга React-приложений.

### GlobalDataScript

Компонент для внедрения серверных данных в клиентский JavaScript. Безопасно сериализует данные при помощи [jsesc](https://github.com/mathiasbynens/jsesc).

### SsrBridge

Объект, предоставляющий методы для связывания серверного и клиентского приложений.

##### ```prepare(serviceKey: string)```

> Метод для использования на сервере. Генерирует идентификаторы для корневого элемента и данных.

##### ```resolve<T>(serviceKey: string)```

> Метод для использования на клиенте. Получает корневой элемент и данные, переданные с сервера.

##### Пример использования:

На сервере:

```tsx
// Провайдер рендеринга верстки
function provideRender(resolve: Resolve) {
    const api = resolve(TOKEN.api);
    const config = resolve(TOKEN.Server.config);
    const params = resolve(KnownToken.Http.Handler.Request.specificParams) as unknown as Params;
    const logger = resolve(KnownToken.logger);
    // Получаем серверную часть "моста" из токена
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
 
На клиенте:
 
```tsx
// Браузерное приложение
BrowserApp().invoke([TOKEN.Client.config, KnownToken.logger, TOKEN.api],
    (config, logger, api) => {
        const sagaMiddleware = createSagaMiddleware({ onError: logger.error });
        // получаем клиентскую часть "моста"
        const ssrBridge = SsrBridge.resolve(config.appName);
        // извлекаем сервеные данные
        const { state } = ssrBridge.serverSideData as { state: DesktopRootState };
        const store = configureStore({
            reducer,
            preloadedState: state,
            middleware: [sagaMiddleware],
            devTools: config.devtools ? { name: `[${config.appName}] - ${document.title}` } : false,
        });

        sagaMiddleware.run(rootSaga, {
            api,
            external: new ExternalClient(config.appName, store.dispatch),
        });
        
        hydrateRoot(
            ssrBridge.rootElement // корневой элемент, отрендеренный на сервере
            <Provider store={store}>
            <ErrorBoundary onError={logger.error} fallback={null}>
               <Component />
            </ErrorBoundary>
            </Provider>,
        );
    },
);
```
