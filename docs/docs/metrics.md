---
sidebar_position: 6
---

# Сбор метрик

Некоторые frontend-микросервисы подразумевают наличие серверной части, работу которой необходимо контролировать. Для этого мы собираем метрики производительности.

Пакет **isomorph** предоставляет реализации базового http-сервера для вывода собранных данных о работе сервиса, а также express-middleware для сбора базовых метрик express-приложения.

## createMetricsHttpApp

**createMetricsHttpApp** вернет готовое express-приложение для сбора метрик.

```ts
import { createMetricsHttpApp } from '@sima-land/isomorph/metrics/node';

const metricsApp = createMetricsHttpApp();

metricsApp.listen(8080);
```

## Middleware для express-приложений

Для захвата стандартных метрик пакет предоставляет фабрики промежуточных слоев.

```ts
import {
  responseMetricsMiddleware,
  renderMetricsMiddleware,
} from '@sima-land/isomorph/http-server/middleware/metrics';
import express from 'express';
import * as PromClient from 'prom-client';

const config = {
  env: 'dev',
  appName: 'example',
  appVersion: 'example',
};

const app = express();

app.use(
  responseMetricsMiddleware(config, {
    counter: new PromClient.Counter(/* ... */),
    histogram: new PromClient.Histogram(/* ... */),
  }),
);

app.use(
  renderMetricsMiddleware(config, {
    histogram: new PromClient.Histogram(/* ... */),
  }),
);
```

**responseMetricsMiddleware** вернет промежуточный слой, который будет фиксировать количество запросов и среднее время ответа.

**renderMetricsMiddleware** вернет промежуточный слой, который будет фиксировать среднее время рендеринга страницы.

:::info Важно

Промежуточный слой, возвращаемый функцией **renderMetricsMiddleware** будет фиксировать время рендера посредством подписки на события начала и завершения рендеринга. Имена этих событий доступны в виде константы `RESPONSE_EVENT` которую можно импортировать из `@sima-land/isomorph/http-server/constants`

:::