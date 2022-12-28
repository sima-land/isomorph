---
sidebar_position: 7
---

# Утилиты

Пакет предоставляет утилиты для работы с библиотеками и фреймворками которые мы используем в наших проектах.

## redux/remote-data

Для работы с удаленными данными пакет пердоставляет набор утилит `RemoteData`.

Пример использования вместе с `createAction` и `createReducer` из пакета `@reduxjs/toolkit`:

```ts
import { createAction, createReducer } from '@reduxjs/toolkit';
import { RemoteData, RemoteDataState } from '@sima-land/isomorph/utils/redux';

interface MyData {
  id: number;
  name: string;
}

interface MyDataState extends RemoteDataState<MyData | null, string | null> {
  readonly myCustomProperty: boolean;
}

const initialState: MyDataState = {
  data: null,
  error: null,
  status: RemoteData.STATUS.initial,
  myCustomProperty: false,
};

const actions = {
  myCustomAction: createAction('my-data/myCustomAction'),

  // определяем action'ы для загрузки данных: request, success, failure
  ...RemoteData.createActions<MyData, string>('my-data'),
};

const reducer = createReducer(initialState, builder => {
  // применяем обработчики action'ов к reducer'у
  RemoteData.applyReducers<MyData, string>(actions, builder);
});

export const MyData = {
  initialState,
  actions,
  reducer,
} as const;
```

Пример использования вместе с `createSlice` из пакета `@reduxjs/toolkit`;

```ts
import { createSlice } from '@reduxjs/toolkit';
import { RemoteData, RemoteDataState } from '@sima-land/isomorph/utils/redux';

interface MyData {
  id: number;
  name: string;
}

interface MyDataState extends RemoteDataState<MyData | null, string | null> {
  readonly myCustomProperty: boolean;
}

const initialState: MyDataState = {
  data: null,
  error: null,
  status: RemoteData.STATUS.initial,
  myCustomProperty: false,
};

export const MyData = createSlice({
  name: 'my-data',
  initialState,
  reducers: {
    ...RemoteData.createHandlers<MyData, string>(),
  },
});
```
