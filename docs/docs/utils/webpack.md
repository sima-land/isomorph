---
title: Утилиты для webpack
description: Утилиты для webpack.
---

# Утилиты для webpack

### EnvPlugin

Плагин для зашивания переменных среды в сборки.

```ts
import { EnvPlugin } from '@sima-land/isomorph/utils/webpack';

// Добавляем EnvPlugin плагин для зашивания переменных среды в сборки. 
{
  plugins: new EnvPlugin(config.env)
}

// Добавляем EnvPlugin плагин на примере сбрки в пакете @dev-dep/scripts. 
// ...(config.env && {
//   plugins: [...(webpackConfig.plugins ?? []), new EnvPlugin(config.env)],
// })

//config.env может содержать следущие опции:
// {
//   /** Целевая среда. */
//   target?: 'auto' | 'web' | 'node';
//   /** Нужно ли использоваь .env файлы. */
//   dotenvUsage?: boolean;
//   /** Переменные, зашиваемые из среды запуска. */
//   additional?: string[];
//   /** Переменные определяемые на месте. */
//   define?: Record<string, string>;
// }
```




### ModuleFederationPlugin

Создает плагин ModuleFederation с опциями, необходимыми для оркестрации удаленных модулей в браузере.

```ts
import { ModuleFederationPlugin } from '@sima-land/isomorph/utils/webpack';
import { ModuleFederationPluginOptions } from '@sima-land/isomorph/utils/webpack';

// Создает плагин ModuleFederation с опциями
new ModuleFederationPlugin({option})

// может содержать следущие опции ModuleFederationPluginOptions:
//{
//  /** Имя сервиса. */
//  name: string;
//  /** Имя удаленной точки входа. */
//  filename?: string;
//  /** Удаленные сервисы.  */
//  remotes?: Record<string, string | RemoteProperty>;
//  /** Предоставляемые сервисы. */
//  exposes?: OriginalModuleFederationPluginOptions['exposes'];
//  /** Общие зависимости.  */
//  shared?: Shared | false;
//  /** Ключ свойства в глобальном объекте,в котором хранится карта точек входа в удаленные сервисы. */
//  remoteEntriesGlobalKey?: string;
//  /** Ключ свойства в глобальном объекте, в который добавляются контейнеры удаленных сервисов. */
//  containersGlobalKey?: string;
//}
```
