---
title: Утилиты для Redux-saga
description: Утилиты для более удобной работы с redux-saga
---
# Утилиты для Redux-saga

Пакет предоставляет утилиты позволяющие работать с redux-saga более практично и удобно.

## takeChain

Эффект собирает все экшены с типом которые мы передали в качестве аргумента в одну коллекцию, после получения каждого экшена из списка он проверяет - все ли экшены из списка были собраны, если это утверждение верно - вызывается эффект с параметрами и массивом полученных экшенов.

:::tip

- Эффект не останавливает весь тред в котором работает в ожидании завершения, так как запускается через `fork`!
- Дубликаты экшенов также попадают в коллекцию
- Если экшены не были собраны за заданное время (timeout), эффект будет также вызван, но в эффект будут переданы только экшены которые были собраны в коллекцию за это время.
  
:::

#### Пример использования

```ts
import { takeChain } from '@sima-land/isomorph/utils/redux-saga';
import { call } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';

function* exampleTakeChain() {
    const actions = [createAction('action1'), createAction('action2')]
    const options = 'example options';

    yield takeChain(200, actions, exampleSaga, options);
    yield put(actions[0]);
    yield put(actions[1]);
}

function* exampleSaga(...params) {
    yield call(console.log, params) // console.log('example options',[createAction('action1'), createAction('action2')])
}

```

## createSagaMiddleware

:::caution

Не рекомендуется к использованию, так как некорректно работает с redux-saga. Следует использовать оригинальный `createSagaMiddleware` из redux-saga.

:::

Обёртка над оригинальным `createSagaMiddleware` из redux-saga, расширяет функционал методами timeout и run, примеры отображены ниже. 

#### Пример использования на SSR

```ts
import { configureStore } from '@reduxjs/toolkit';
import { createSagaMiddleware } from '@sima-land/isomorph/utils/redux-saga';


function async initApp(logger) {
    const onError = logger.error;
    const sagaMiddleware = createSagaMiddleware({ onSagaError: logger.error });
    const options = {};

    ...
    const store = configureStore({
      ...
      middleware: [sagaMiddleware],
    });
    /** Не более 500мс на выполнение саги rootSaga **/
    await sagaMiddleware.timeout(500).run(rootSaga, options);
    ...

}

```

#### Пример использования на nonSSR

```ts
import { configureStore } from '@reduxjs/toolkit';
import { createSagaMiddleware } from '@sima-land/isomorph/utils/redux-saga';

function initApp(logger) {
    const onError = logger.error;
    const sagaMiddleware = createSagaMiddleware({ onSagaError: logger.error });
    const options = {};

    ...
    const store = configureStore({
      ...
      middleware: [sagaMiddleware],
    });
    /** Вызываем сагу не ограничивая её во времени. **/
    sagaMiddleware.run(rootSaga, options);
    ...

}

```
