---
title: Утилиты для React
description: Утилиты для работы с React.
---
# Утилиты для React

Пакет предоставляет утилиты для работы с React.

### ErrorBoundary

- Компонент перехватчик ошибок, обрабатывает все ошибки при рендере дочерних элементов.
- Рендерит fallback если была выявлена ошибка при рендере всех дочерних элементов.

##### Пример использования:

```tsx
import React from 'react';
import { App } from './app';
import { ErrorBoundary } from '@sima-land/isomorph/utils/react';

const rootElement = document.getElementById(config.appName);
const onError = logger.error;

createRoot(rootElement).render(
    <ErrorBoundary onError={onError} fallback={null}>
        <App />
    </ErrorBoundary>,
);
```

### SafeSuspense

Компонент обёртки Suspense из React, дополнительно использующая ErrorBoundary в реализации.

##### Пример использования:

```tsx
import React from 'react';
import { App } from './app';
import { SafeSuspense } from '@sima-land/isomorph/utils/react';

const rootElement = document.getElementById(config.appName);
const onError = logger.error;

createRoot(rootElement).render(
    <SafeSuspense onError={onError} fallback={null}>
        <App />
    </SafeSuspense>,
);
```
