---
title: Утилиты для отправки аналитики
description: Утилиты для отправки аналитики в dataLayer и ОКО.
---

# Утилиты для отправки аналитики

Пакет предоставляет утилиты для отправки аналитических данных в объект dataLayer и ОКО. 

---

## dataLayerPush

Функция `dataLayerPush` отправляет данные события в глобальный объект `dataLayer`. Данные передаются в виде объекта, который копируется перед отправкой, чтобы избежать изменений в процессе работы.

Функция проверяет наличие `window.dataLayer.push` перед отправкой данных.

#### Пример использования

```ts
import { dataLayerPush } from '@sima-land/isomorph/utils/web/analytics';
import { call } from 'typed-redux-saga/macro';

/**
 * Отправляет события о новом пользователе.
 * @param userId ID пользователя.
 */
export function* sendNewUserAnalytics(userId: number) {
  // Отправка события в dataLayer
  yield* call(dataLayerPush, { event: 'new_user', uid: userId });
}
```

## okoPush

Функция okoPush отправляет данные события в глобальный объект oko, если он существует на странице. Данные передаются в виде объекта типа `OkoEvent`, который копируется перед отправкой, чтобы избежать изменений в процессе работы.

Функция проверяет наличие `window.oko.push` перед отправкой данных.

### Тип OkoEvent

 `export type OkoEvent = Record<string, any>;`

OkoEvent представляет собой объект произвольной структуры, используемый для передачи данных событий в ОКО.

#### Пример использования

```ts
import { okoPush } from '@sima-land/isomorph/utils/web/analytics';
import { call } from 'typed-redux-saga/macro';

/**
 * Отправляет события о новом пользователе.
 * @param userId ID пользователя.
 */
export function* sendOkoUserAnalytics(userId: number) {
  // Отправка события в okoPush
  yield* call(okoPush, { event: 'new_user', uid: userId });
}
```
