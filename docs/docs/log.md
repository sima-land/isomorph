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
import { createLogger } from '@sima-land/isomorph/log';

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
import { logMiddleware } from '@sima-land/isomorph/http-server/middleware/log';
import { create } from 'middleware-axios';

const client = create();

const middleware = logMiddleware({
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
import { logMiddleware } from '@sima-land/isomorph/http-server/middleware/log';
import { createLogger } from '@sima-land/isomorph/log';
import express from 'express';

const logger = createLogger();
const app = express();

app.use(config, logMiddleware(logger));
```

### Сбор ошибок

Для отслеживания ошибок мы используем преимущественно **Sentry**. Отправку ошибок и других событий в Sentry можно реализовать используя Logger со специальным обработчиком для Sentry.

Пакет предоставляет классы для формирования готовых к отправке объектов, представляющих ошибки и "хлебные крошки".

## Примеры использования

Подготовим логгер и обработчик для него. Для работы обработчику нужен Sentry Hub.

```ts
import { createLogger } from '@sima-land/isomorph/log';
import { createSentryHandler } from '@sima-land/isomorph/log/handler/sentry';
import { BrowserClient, Hub } from '@sentry/browser';

const sentryClient = new BrowserClient({ dsn: process.env.SENTRY_DSN });
const sentryHub = new Hub(sentryClient);

const logger = createLogger();

logger.subscribe(createSentryHandler(sentryHub));
```

Зарегистрированный обработчик будет отсылать все ошибки и "хлебные крошки" в Sentry.
Любые данные, переданные логгеру через метод `error` также будут отправлены в Sentry.

```ts
import { SentryError, SentryBreadcrumb } from '@sima-land/isomorph/log';

// отправка ошибки
logger.error(
  new SentryError('something wrong', {
    extra: {
      key: 'something',
      data: 'wrong',
    },
  }),
);

// отправка "хлебной крошки"
logger.info(
  new SentryBreadcrumb({
    category: 'something happens',
    data: {
      foo: 1,
      bar: 2,
    },
  }),
);
```
