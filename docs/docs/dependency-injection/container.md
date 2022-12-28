---
sidebar_position: 1
---

# Введение

Архитектуру современного приложения практически невозможно представить без _инверсии управления_. Внедрение зависимостей является реализацией этого подхода и в **isomorph** оно реализовано исходя из следующих ограничений:

- Не используем рефлексии (`reflect-metadata`), так как эта надстройка много весит и медленно работает
- Не используем декораторы, так как они пока не попали в стандарт ECMAScript

Итоговый размер сборки важен, так как **isomorph** используется в том числе в браузерных приложениях.

## DI-контейнер

Для внедрения зависимостей пакет предоставляет реализацию DI-контейнера. Исходя из заявленных ранее ограничений, реализовать автоматическую подстановку зависимостей на основе рефлексий не представляется возможным. Эта проблема решается наличием ряда архитектурных ограничений.

На данный момент все компоненты в рамках DI-контейнера являются "синглтонами".

### Термины

**Токен** - уникальное значение, которое можно использовать для регистрации компонента в DI-контейнере.

Можно было бы использовать уникальные строки или символы, однако токен позволяет закрепить за собой конкретный интерфейс. В разработке это помогает автоматически выводить типы а также предупреждать о том, что реализация не соответствует интерфейсу при регистрации.

**Провайдер** - функция, которая занимается предоставлением реализации интерфейса.

Функция-провайдер получает в качестве аргумента функцию-геттер зависимостей. Обычно провайдер просто предоставляет зависимости для реализации но может также выбрать реализацию.

### Ограничения

- реализации не должны ничего знать про контейнер/токены, для этого есть провайдеры
- стоит вызывать resolve только в рамках функции-провайдера
- стоит разделять интерфейс и его реализацию по разным файлам

### Пример использования

Для начала создадим файл со всеми токенами. Предполагается, что у нас уже есть интерфейсы компонентов нашего приложения.

```ts title="tokens.ts"
import { createToken } from '@sima-land/isomorph/di';
import type { Config, Logger, Server } from './interfaces';

export const TOKEN = {
  config: createToken<Config>('config'),
  logger: createToken<Logger>('logger'),
  server: createToken<Server>('server'),
} as const;
```

Опишем DI-контейнер.

```ts title="container.ts"
import { createContainer, Resolve } from '@sima-land/isomorph/di';
import { TOKEN } from './tokens';
import express from 'express';

export const container = createContainer();

container.set(TOKEN.config, provideConfig);
container.set(TOKEN.logger, provideLogger);
container.set(TOKEN.server, provideServer);

function provideConfig(): Config {
  return {
    name: 'example-app',
    port: Number(process.env.PORT),
  };
}

function provideLogger(): Logger {
  return {
    info(data) {
      console.log(data);
    },
  };
}

function provideServer(resolve: Resolve): Server {
  const logger = resolve(TOKEN.logger);
  const app = express();

  app.get('/home', (req, res) => {
    logger.info(`Incoming request, timestamp: ${Date.now()}`);
    res.send('Hello, world!');
  });

  return app;
}
```

Теперь мы можем использовать контейнер в точке входа.

```ts title="index.ts"
import { container } from './container';
import { TOKEN } from './tokens';

const server = container.get(TOKEN.server);
const logger = container.get(TOKEN.logger);
const config = container.get(TOKEN.config);

server.listen(config.port, () => {
  logger.info(`Server started on port ${config.port}`);
});
```
