---
title: Утилиты для Redux-saga
description: Утилиты для более удобной работы с redux-saga
---
# Утилиты для Redux-saga

Пакет предоставляет утилиты позволяющие работать с redux-saga более практично и удобно.

## takeChain

Сага собирает все экшены с типом который мы передали в качестве аргумента в одну коллекцию, после отлова каждого экшена из списка она проверяет - все ли экшены из списка были собраны, если это утверждение верно - вызывается эффект с параметрами и массивом отловленных экшенов.

:::tip

- Сага не останавливает весь тред в котором работает в ожидании завершения, так как запускается через `fork`!
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

    yield takeChain(200,actions, exampleSaga,options);
    yield put(actions[0]);
    yield put(actions[1]);
}

function* exampleSaga(...params) {
    yield call(console.log,params) // console.log('example options',[createAction('action1'), createAction('action2')])
}

```

## createSagaMiddleware

:::caution

В данный момент не актуально и можно сказать deprecated, так как в redux-saga была проблема с ней из-за чего советуется пока использовать оригинальный `createSagaMiddleware` из redux-saga.
Доработки будут внесены позже.

:::

- Обёртка над оригинальным `createSagaMiddleware` из redux-saga, расширяет и делает более удобным его использование.

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
