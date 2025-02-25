---
title: Утилиты для webpack
description: Утилиты для webpack.
---

# Утилиты для webpack

### EnvPlugin

Плагин для зашивания переменных среды в сборки.
Для правильной работы ConfigSource в браузерных сборках, пакет isomorph предоставляет плагин EnvPlugin, который зашьёт переменные среды в специальный глобальный объект __ISOMORPH_ENV__.

```ts
import { EnvPlugin } from '@sima-land/isomorph/utils/webpack';

// Добавляем EnvPlugin плагин для зашивания переменных среды в сборки. 
{
  plugins: new EnvPlugin(config.env)
}

// Добавляем EnvPlugin плагин на примере сбрки в пакете @dev-dep/scripts. 
 ...(config.env && {
   plugins: [...(webpackConfig.plugins ?? []), new EnvPlugin(config.env)],
 })

//config.env может содержать следущие опции:
 {
   /** Целевая среда. */
   target?: 'auto' | 'web' | 'node';
   /** Нужно ли использоваь .env файлы. */
   dotenvUsage?: boolean;
   /** Переменные, зашиваемые из среды запуска. */
   additional?: string[];
   /** Переменные определяемые на месте. */
   define?: Record<string, string>;
 }
```

### target - Указывает для какой сборки создается конфигурация. 
#### 'web' - браузерная сборка. 'node' - серверная сборка.
#### 'auto' - Значение тогда берется из конфигурации конфига webpack: `{ target: 'web' }`
Если полученное значение отличается от 'web' или 'node' будет сообщение об ошибке: [EnvPlugin] Target is unknown, variables will NOT be added' 

Плагин формирует список переменных среды из которых буду выбраны нужные, командой:
```ts
const result = { ...process.env };
```
### dotenvUsage - указывает нужно ли дополнять список переменных среды из файлов .env  
В файлах .env и .env.development указываются дополнительные переменные среды для сборок соответствующие окружению для продакшн и разработки. 
При указании dotenvUsage: true, реализация плагина будет также пытаться прочитать env-файл, соответствующий окружению, определенному переменной среды NODE_ENV. Например для NODE_ENV='development' будет выполнена попытка прочитать файл .env.development

### additional - массив строк
#### Так как плагин будет зашивать в браузерную сборку только переменные среды, имеющие префикс PUBLIC_. В additional можно передать дополнительные переменные среды, которые тоже должны попасть в сборку. Передаются только наименования переменных.
```ts
      env: {
        additional: ['APP_NAME', 'APP_VERSION', 'SENTRY_RELEASE'],
      }
```
### define - объект, ключ - значение. Как и в additional передаются переменные среды, которые тоже должны попасть в сборку. Но переданный объект содержит не только наименования переменных, но их значение. 
```ts
      env: {
        define: {
          ASSETS_MANIFEST_MOBILE: `../client/assets-manifest.mobile.${env.BUILD_ASSET_POSTFIX}.json`,
          ASSETS_MANIFEST_DESKTOP: `../client/assets-manifest.desktop.${env.BUILD_ASSET_POSTFIX}.json`,
        }
      }
```
