# Утилиты для Axios

В качестве реализации HTTP-клиентов используется `axios` с дополнением в виде пакета `middleware-axios`, позволяющего добавлять промежуточные слои процесса исходящих HTTP-запросов.

## Логирование

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

## Sauce

Пакет предоставляет функцию `sauce` позволяющую сделать возвращаемые из методов экземпляра `AxiosInstance` промисы "безопасными".

"Безопасный" промис никогда не перейдет в состояние rejected. Вместо этого, в состоянии resolved, результатом будет объект-обертка над `AxiosResponse`.

```js
import { create } from 'axios';
import { sauce } from '@sima-land/isomorph/utils/axios';

const client = sauce(create({ baseURL: 'http://some-api.com/' }));

const { ok, data, error } = await client.get('/some-endpoint');

if (ok) {
  console.log(data);
} else {
  console.error(error);
}
```
