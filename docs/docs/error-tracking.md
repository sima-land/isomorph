---
sidebar_position: 4
---

# Отслеживание ошибок

Для отслеживания ошибок мы используем преимущественно **Sentry**. Отправку ошибок и других событий в Sentry можно реализовать используя Logger со специальным обработчиком для Sentry.

Пакет предоставляет классы для формирования готовых к отправке объектов, представляющих ошибки и "хлебные крошки".

## Примеры использования

Подготовим логгер и обработчик для него. Для работы обработчику нужен Sentry Hub.

```ts
import { createLogger } from '@sima-land/isomorph/logger';
import { createSentryHandler } from '@sima-land/isomorph/logger/handler/sentry';
import { BrowserClient, Hub } from '@sentry/browser';

const sentryClient = new BrowserClient({ dsn: process.env.SENTRY_DSN });
const sentryHub = new Hub(sentryClient);

const logger = createLogger();

logger.subscribe(createSentryHandler(sentryHub));
```

Зарегистрированный обработчик будет отсылать все ошибки и "хлебные крошки" в Sentry.
Любые данные, переданные логгеру через метод `error` также будут отправлены в Sentry.

```ts
import { SentryError, SentryBreadcrumb } from '@sima-land/isomorph/error-tracking';

// отправка ошибки
logger.error(
  new SentryError('something wrong', {
    extra: { key: 'something', data: 'wrong' },
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
