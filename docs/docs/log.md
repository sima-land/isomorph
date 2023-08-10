---
sidebar_position: 3
---

# Логирование

Для логирования событий пакет предоставляет простейшую реализацию логгера - объекта, содержащего методы для фиксации событий жизненного цикла приложения.

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

## Сбор ошибок

Для отслеживания ошибок мы используем преимущественно **Sentry**. Отправку ошибок и других событий в Sentry можно реализовать используя Logger со специальным обработчиком для Sentry.

Пакет предоставляет классы для формирования готовых к отправке объектов, представляющих ошибки и "хлебные крошки".

### Примеры использования

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
import { DetailedError, Breadcrumb } from '@sima-land/isomorph/log';

// отправка ошибки
logger.error(
  new DetailedError('something wrong', {
    extra: {
      key: 'something',
      data: 'wrong',
    },
  }),
);

// отправка "хлебной крошки"
logger.info(
  new Breadcrumb({
    category: 'something happens',
    data: {
      foo: 1,
      bar: 2,
    },
  }),
);
```
