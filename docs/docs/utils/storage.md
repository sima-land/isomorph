---
title: Утилиты для Web Storage
description: Безопасная работа с браузерным хранилищем.
---

## createSafeStorage

Пакет предоставляет функцию, создающую обертку для безопасной работы 
с API Web Storage.

##### Пример использования:

```ts
import { createSafeStorage } from '@sima-land/isomorph/utils/web/storage';

function saveUserPreferences(prefs: UserPreferences) {
    const storage = createSafeStorage(() => window.localStorage)

    // Проверяем доступность браузерного хранилища в текущей среде выполнения.
    if (!storage.isAvailable()) {
        console.warn('Storage is not available');
        return;
    }

    storage.setItem('user-prefs', JSON.stringify(prefs));
}
```



