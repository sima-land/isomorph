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

