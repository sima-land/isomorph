---
title: Утилиты для Express сервера.
description: Утилиты для Express сервера.
---
# Утилиты для Express сервера

Пакет предоставляет утилиты для работы с сервером Express

## healthCheck

Обработчик возвращающий в json формате данные о времени работы сервера в миллисекундах

#### Пример использования:

```tsx
import express from 'express';
import { healthCheck } from '@sima-land/isomorph/http-server/handler/health-check';

function InitApp() {
    const app = express();
    ....
    // Все запросы на эндпоинт /healthcheck будут возвращать аптайм сервера в миллисекундах.
    app.get('/healthcheck', healthCheck());
    ....
}

```

## composeMiddleware

Обработчик собирающий массив промежуточных слоёв и вызывая их по очереди

##### Пример использования:

```tsx
import express from 'express';
import { composeMiddleware } from '@sima-land/isomorph/utils/express';
import { HandlerProvider } from '@sima-land/isomorph/preset/node';

function InitApp() {
    const DesktopApp = createApplication();
    ...
    const desktopHandler = HandlerProvider(DesktopApp)
    const app = express();
    ....
    const logger = (req: Express.Request,res: Express.Response,next: Express.NextFunction) => {
        console.log('test')
        next();
    }
    // Все запросы на эндпоинт /example сначала будут логироваться через обработчик `logger`
    // После этого будет обрабатываться `desktopHandler`
    app.get('/example', composeMiddleware([logger,desktopHandler]));
    ....
}

```
