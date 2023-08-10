# Утилиты для Axios

В качестве реализации HTTP-клиентов используется `axios` с дополнением в виде пакета `middleware-axios`, позволяющего добавлять промежуточные слои процесса исходящих HTTP-запросов.

### Логирование

Также пакет предоставляет функцию создания middleware для логирования исходящих http-запросов.

```ts
import { create } from 'middleware-axios';
import { logMiddleware } from '@sima-land/isomorph/utils/axios';

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

### "Прозрачные" cookie

На сервере бывает необходимо выполнить HTTP-запрос к публичным API от имени пользователя.

Пакет предоставляет функцию для создания промежуточного слоя,
накапливающего cookie из ответов на исходящие запросы в ответ express-приложения.

```ts
import { create } from 'middleware-axios';
import { createCookieStore } from '@sima-land/isomorph/http';
import { cookieMiddleware } from '@sima-land/isomorph/utils/axios';

const client = create();
const cookieStore = createCookieStore();

// при запросе cookie из хранилища будут автоматически добавлены в заголовки
client.use(cookieMiddleware(cookieStore));
```

## Sauce

TODO
