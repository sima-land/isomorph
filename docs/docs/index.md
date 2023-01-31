---
sidebar_position: 0
---

# О пакете

`@sima-land/isomorph` - минималистичный JS-фреймворк для быстрого старта frontend-микросервисов.

Содержит утилиты для стека:

- react
- redux
- redux-saga
- axios
- express
- webpack
- sentry (отслеживание ошибок)
- opentelemetry/jaeger (трассировка)
- prometheus (метрики)

## Установка

```bash
# используя npm...
npm install --save @sima-land/isomorph

# ...или yarn
yarn add @sima-land/isomorph
```

## Название

Название выбрано исходя из того факта, что большинство задач во время выполнения программы приходится решать как в браузере так и на сервере. Для этих целей isomorph по необходимости вводит абстракции которые не привязаны к среде выполнения.
