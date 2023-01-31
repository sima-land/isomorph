/* eslint-disable require-jsdoc */
import {
  ActionReducerMapBuilder,
  Draft,
  PayloadAction,
  PayloadActionCreator,
  createAction,
  createSelector,
} from '@reduxjs/toolkit';

interface RemoteDataActions<TData, TError = unknown, TPayload = void> {
  request: PayloadActionCreator<TPayload, string>;
  success: PayloadActionCreator<TData, string>;
  failure: PayloadActionCreator<TError, string>;
}

/**
 * Статус загрузки данных.
 */
export type Status = 'initial' | 'fetching' | 'success' | 'failure';

/**
 * Базовая структура хранилища удаленных данных.
 */
export interface RemoteDataState<TData, TError> {
  /** Загружаемые данные. */
  readonly data: TData;

  /** Данные ошибки запроса. */
  readonly error: TError;

  /** Статус загрузки данных. */
  readonly status: Status;

  /** Количество запросов. */
  readonly fetchCount?: number;
}

/**
 * Возможные статусы загрузки данных.
 */
export const STATUS: Record<Status, Status> = {
  initial: 'initial',
  fetching: 'fetching',
  success: 'success',
  failure: 'failure',
} as const;

/** Работа с удаленными данными. */
export abstract class RemoteData {
  static get STATUS() {
    return STATUS;
  }

  /**
   * Возвращает action'ы для работы с удаленными данными.
   * @param name Префикс имён.
   * @return Набор.
   */
  static createActions<TData = never, TError = never, TPayload = void>(
    name: string,
  ): RemoteDataActions<TData, TError, TPayload> {
    return {
      request: createAction<TPayload>(`${name}/request`),
      success: createAction<TData>(`${name}/success`),
      failure: createAction<TError>(`${name}/failure`),
    } as const;
  }

  /**
   * Возвращает набор обработчиков для работы с удаленными данными.
   * @return Набор.
   */
  static createHandlers<
    TData,
    TError,
    S extends RemoteDataState<TData, TError> = RemoteDataState<TData, TError>,
  >() {
    // ВАЖНО: не используем возможности immer здесь чтобы набор можно было использовать без immer.
    return {
      request(state: S | Draft<S>): S | Draft<S> {
        return {
          ...state,
          status: STATUS.fetching,
        };
      },

      success(state: S | Draft<S>, action: PayloadAction<TData>): S | Draft<S> {
        return {
          ...state,
          data: action.payload,
          status: STATUS.success,
          fetchCount: (state.fetchCount ?? 0) + 1,
        };
      },

      failure(state: S | Draft<S>, action: PayloadAction<TError>): S | Draft<S> {
        return {
          ...state,
          error: action.payload,
          status: STATUS.failure,
          fetchCount: (state.fetchCount ?? 0) + 1,
        };
      },
    } as const;
  }

  /**
   * Применяет обработчики для работы с удаленными данными.
   * @param actions Набор action'ов.
   * @param builder Builder.
   */
  static applyHandlers<TData, TError>(
    actions: RemoteDataActions<TData, TError, any | never>,
    builder: Pick<ActionReducerMapBuilder<RemoteDataState<TData, TError>>, 'addCase'>,
  ): void {
    const handlers = RemoteData.createHandlers<TData, TError>();

    // @todo разобраться с проблемой когда убираешь ".type"
    builder.addCase(actions.request.type, handlers.request);
    builder.addCase(actions.success.type, handlers.success);
    builder.addCase(actions.failure.type, handlers.failure);
  }

  /**
   * Возвращает новый набор селекторов данных.
   * @param selectRoot Функция получения состояния.
   * @return Набор селекторов.
   */
  static createSelectors<S extends RemoteDataState<unknown, unknown>, R = unknown>(
    selectRoot: (root: R) => S,
  ) {
    return {
      isInitial: createSelector(selectRoot, state => state.status === 'initial'),
      isFetching: createSelector(selectRoot, state => state.status === 'fetching'),
      isSuccess: createSelector(selectRoot, state => state.status === 'success'),
      isFailed: createSelector(selectRoot, state => state.status === 'failure'),
      wasFetched: createSelector(selectRoot, state => (state.fetchCount ?? 0) > 0),
    } as const;
  }
}

/**
 * Возвращает набор обработчиков для работы с удаленными данными.
 * @deprecated Теперь нужно использовать RemoteData.createHandlers.
 * @return Набор.
 */
export const createRemoteDataReducers = <S extends RemoteDataState<any, any>>() => ({
  request: (state: Draft<S>) => {
    state.status = STATUS.fetching;
  },
  success: (state: Draft<S>, action: PayloadAction<S['data']>) => {
    state.data = action.payload;
    state.status = STATUS.success;
  },
  failure: (state: Draft<S>, action: PayloadAction<S['error']>) => {
    state.error = action.payload;
    state.status = STATUS.failure;
  },
});
