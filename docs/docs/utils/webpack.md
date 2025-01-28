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
// ...(config.env && {
//   plugins: [...(webpackConfig.plugins ?? []), new EnvPlugin(config.env)],
// })

//config.env может содержать следущие параметры:
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

```
