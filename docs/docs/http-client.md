---
sidebar_position: 3
---

# HTTP-клиент

В качестве реализации HTTP-клиентов используется `axios` с дополнением в виде пакета `middleware-axios`, позволяющего добавлять промежуточные слои процесса исходящих HTTP-запросов.

## Прозрачные cookies

На сервере бывает необходимо выполнить HTTP-запрос к публичным API от имени пользователя.

Пакет предоставляет функцию для создания промежуточного слоя,
накапливающего cookie из ответов на исходящие запросы в ответ express-приложения.

```ts
import express from 'express';
import { create } from 'middleware-axios';
import { collectCookieMiddleware } from '@sima-land/isomorph/http-client/middleware/cookie';

const app = express();

app.get('/home', (req, res) => {
  const client = create({ baseURL: 'https://www.test.com/' });

  client.use(collectCookieMiddleware(req, res));

  // все полученные cookie будут автоматически записаны в res
  client.get('https://www.sima-land.ru/api/v3/user').then(() => {
    res.send(200);
  });
});
```

## Трассировка (Node.js)

Для трассировки исходящих запросов в рамках формирования ответа на входящий запрос пакет также предоставляет возможность создать промежуточный слой:

```ts
import express from 'express';
import { create } from 'middleware-axios';
import { tracingMiddleware } from '@sima-land/isomorph/http-client/middleware/tracing';
import { Tracer, Context } from '@opentelemetry/api';

declare const tracer: Tracer;
declare const context: Context;

const app = express();

app.get('/home', (req, res) => {
  const client = create({
    baseURL: 'https://www.test.com/',
  });

  client.use(tracingMiddleware(tracer, context));

  // все исходящие запросы будут отражены как стадии основного процесса ответа
  client.get('https://www.sima-land.ru/api/v3/user').then(() => {
    res.send(200);
  });
});
```

:::info Важно

При использовании DI-проложения с пресетами `PresetNode` и `PresetResponse` нет необходимости вручную конфигурировать промежуточные слои и формировать трассировщик и корневой контекст.

:::

## Sauce

TODO
