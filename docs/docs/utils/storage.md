---
title: Утилиты для Web Storage
description: Безопасная работа с браузерным хранилищем.
---

## createSafeStorage

Пакет предоставляет функцию создающую обертку для безопасной работы 
с браузерным хранилищем (localStorage и sessionStorage).

Интерфейс обертки:

```ts
interface SafeStorage extends Storage {
  isAvailable: () => boolean;
}
```


Пример использования:

```ts
import { createSafeStorage } from '@sima-land/isomorph/utils/web/storage';

function saveUserPreferences(prefs: UserPreferences) {
    const storage = createSafeStorage(() => window.localStorage)

    // проверяем доступность браузерного хранилища в текущей среде выполнения.
    if (!storage.isAvailable()) {
        console.warn('Storage not available');
        return;
    }

    storage.setItem('user-prefs', JSON.stringify(prefs));
}
```



