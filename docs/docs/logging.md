---
sidebar_position: 3
---

# Журналирование событий

Для журналирования событий пакет предоставляет простейшую реализацию логгера - объекта, содержащего методы для фиксации событий жизненного цикла приложения.

## Logger

Интерфейс **Logger** имеет ряд методов для фиксации наиболее распространённых событий работы программы, вроде `info`, `error`, `debug` и тд подобно объекту [console](https://developer.mozilla.org/ru/docs/Web/API/Console).

**Logger** реализует простейшую систему подписки на события, благодаря чему их можно выводить в консоль, отправлять в Sentry и тд.

### Пример использования

```ts
import { createLogger } from '@sima-land/isomorph/logger';

const logger = createLogger();

// регистрация обработчика
logger.subscribe(event => {
  console.log(event.type, event.data);
});

// ...позже в коде
if (somethingWrong) {
  logger.error('something wrong');
}
```

### Middleware для HTTP-клиента

Также пакет предоставляет функцию создания middleware для логирования исходящих http-запросов.

```ts
import { loggingMiddleware } from '@sima-land/isomorph/http-client/middleware';
import { create } from 'middleware-axios';

const client = create();

const middleware = loggingMiddleware({
  beforeRequest({ config, defaults }) {
    console.log('beforeRequest');
  },
  afterResponse({ config, defaults, responser }) {
    console.log('afterResponse');
  },
  onCatch({ config, defaults, error }) {
    console.log('onCatch');
  },
});

client.use(middleware);
```

### Middleware для express-приложения

Аналогичная утилита предоставляется для express-приложений. Созданный промежуточный слой будет сообщать логгеру базовую информацию о входящем запросе и ответе.

```ts
import { loggingMiddleware } from '@sima-land/isomorph/http-server/middleware';
import { createLogger } from '@sima-land/isomorph/logger';
import express from 'express';

const logger = createLogger();
const app = express();

app.use(config, loggingMiddleware(logger));
```
