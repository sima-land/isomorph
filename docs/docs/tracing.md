---
sidebar_position: 5
---

# Трассировка процессов

Для трассировки мы используем **OpenTelemetry** в качестве основного инструмента сбора и **Jaeger** для хранения и анализа полученных данных.

Ознакомиться с использованием **OpenTelemetry** можно на [официальном сайте](https://opentelemetry.io/).

Пакет **isomorph** на данный момент предоставляет несколько простых утилит для базовой трассировки ответов express-приложения.

## tracingMiddleware (express)

**tracingMiddleware** возвращает готовый промежуточный слой для express-приложения. Этот промежуточный слой будет создавать span на каждый запрос и завершать его при ответе.

Контекст и корневой span доступны на `res.locals.tracing.rootContext` и `res.locals.tracing.rootSpan` соответственно.

## tracingMiddleware (middleware-axios)

**tracingMiddleware** возвращает готовый промежуточный слой для `AxiosInstanceWrapper`. Этот промежуточный слой будет создавать span на каждый запрос и завершать его при ответе.
