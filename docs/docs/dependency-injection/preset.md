---
sidebar_position: 3
---

# Пресеты

**Preset** - набор провайдеров. Пресеты можно применить к приложениям. Сам по себе пресет не хранит компоненты и не инициализирует их. Он только предоставляет провайдеры.

Обычно в проектах не придется самостоятельно создавать пресеты. В будущем функциональность пресетов может перейти к самому приложению.

Пакет **isomorph** предоставляет несколько пресетов, цель которых унифицировать похожие по функционалу микросервисы.

### Пример использования

Возьмем пресет Node.js-приложения из пакета.

```ts
import { createApplication } from '@sima-land/isomorph/di';
import { PresetNode } from '@sima-land/isomorph/preset/node';

const app = createApplication();

app.preset(PresetNode());
```

Пресеты позволяют переопределять заложенные в них провайдеры в отличие от приложений и DI-контейнеров.

```ts
import { createApplication } from '@sima-land/isomorph/di';
import { PresetNode } from '@sima-land/isomorph/preset/node';

const app = createApplication();

const preset = PresetNode()
  .set(TOKEN.foo, provideFoo)
  .set(TOKEN.bar, provideBar)
  .set(TOKEN.baz, provideBaz);

app.preset(preset);
```
## В библиотеке @sima-land/isomorph есть доступные пресеты приложений:

### PresetWeb - Возвращает preset с зависимостями для frontend-микросервисов в браузере.

```ts title="app.ts"
import { createApplication } from '@sima-land/isomorph/di';
import { PresetWeb } from "../index";
import { KnownToken } from '@sima-land/isomorph/tokens';
import { BaseConfig } from '@sima-land/isomorph/config';

export interface AppConfig extends BaseConfig {
  devtoolsEnabled: boolean;
}

export const TOKEN = {
  config: createToken<AppConfig>('app/config'),
  Known: KnownToken,
} as const;

/* Возвращает браузерное приложение с уже готовым набором провайдеров. */
export function BrowserApp() {

  const app = createApplication();
  app.preset(PresetWeb());

  // регистрируем компонент с помощью провайдера
  app.bind(TOKEN.config).toProvider(provideConfig);
  
  return app;
}

function provideConfig(resolve: Resolve): AppConfig {
  const source = resolve(TOKEN.Known.Config.source);
  const baseConfig = resolve(TOKEN.Known.Config.base);

  return {
    ...baseConfig,
//    devtoolsEnabled: source.require('PUBLIC_DEVTOOLS_ENABLED') !== '0',
  };
}
```
#### Встроенный функционал, который предоставляет PresetWeb:
##### Провайдер источника конфигурации. [KnownToken.Config.source]
##### Провайдер базовой конфигурации приложения. [KnownToken.Config.base]
##### Провайдер Logger'а. [KnownToken.logger]
##### Провайдер промежуточного слоя redux-saga для redux-хранилища. [KnownToken.Redux.Middleware.saga]
##### Провайдер фабрики экземпляров AxiosInstanceWrapper. [KnownToken.Axios.factory]
##### Провайдер фабрики http-клиентов. [KnownToken.Axios.middleware]
##### Провайдер обработчика логирования исходящих http-запросов. [KnownToken.Axios.Middleware.Log.handler]
##### Провайдер клиентской части "моста" для передачи данных между сервером и клиентом. [KnownToken.SsrBridge.clientSide]
##### Провайдер известных http-хостов. [KnownToken.Http.Api.knownHosts]
##### Провайдер функции fetch. [KnownToken.Http.fetch]
##### Провайдер промежуточных слоев для fetch. [KnownToken.Http.Fetch.middleware]

После регистрации мы можем использовать компоненты, как из пресета, так и добавленные:

```ts title="index.ts"
import { app } from './app';

app.invoke([TOKEN.config, TOKEN.Known.logger], (config, logger) => {
logger.info(config.appName);
});
```
