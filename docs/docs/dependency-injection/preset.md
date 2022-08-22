---
sidebar_position: 3
---

# Пресеты

**Preset** - набор провайдеров. Пресеты можно применить к приложениям. Сам по себе пресет не хранит компоненты и не инициализирует их. Он только предоставляет провайдеры.

Обычно в проектах не придется самостоятельно создавать пресеты. В будущем функциональность пресетов может перейти к самому приложению.

Пакет **isomorph** предоставляет несколько пресетов, цель которых унифицировать похожие по функционалу микросервисы.

### Пример использования

Возьмем пресет Node.js-приложения из пакета.

```ts
import { createApplication } from '@sima-land/isomorph/di';
import { PresetNode } from '@sima-land/isomorph/preset/node';

const app = createApplication();

app.preset(PresetNode());
```

Пресеты позволяют переопределять заложенные в них провайдеры в отличии от приложений и DI-контейнеров.

```ts
import { createApplication } from '@sima-land/isomorph/di';
import { PresetNode } from '@sima-land/isomorph/preset/node';

const app = createApplication();

const preset = PresetNode()
  .set(TOKEN.foo, provideFoo)
  .set(TOKEN.bar, provideBar)
  .set(TOKEN.baz, provideBaz);

app.preset(preset);
```
