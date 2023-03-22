---
sidebar_position: 3
---

# HTTP-клиент

В качестве реализации HTTP-клиентов используется `axios` с дополнением в виде пакета `middleware-axios`, позволяющего добавлять промежуточные слои процесса исходящих HTTP-запросов.

## "Прозрачные" cookie

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

## Sauce

TODO
