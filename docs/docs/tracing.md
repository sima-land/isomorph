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

```ts
import express from 'express';
import { create } from 'middleware-axios';
import { tracingMiddleware } from '@sima-land/isomorph/http-client/middleware/tracing';
import { Tracer, Context } from '@opentelemetry/api';

declare const tracer: Tracer;
declare const context: Context;

const client = create({
  baseURL: 'https://www.test.com/',
});

client.use(tracingMiddleware(tracer, context));

// все исходящие запросы будут отражены как стадии основного процесса
client.get('https://www.sima-land.ru/api/v3/user');
```

:::info Важно

При использовании DI-проложения с пресетом `PresetHandler` нет необходимости вручную конфигурировать промежуточные слои, а также трассировщик и контекст. Фабрика (доступна по токену `KnownToken.Http.Client.factory`) будет возвращать клиент, который уже связан с контекстом входящего запроса.

:::
