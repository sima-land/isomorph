/* eslint-disable require-jsdoc */

// @todo "* as" сделано для работы в Node.js ESM но есть подозрение что на tree shaking плохо скажется
import * as redux from '@reduxjs/toolkit';

const { createAction, createSelector } = redux;

interface RemoteDataActions<TData, TError = unknown, TPayload = void> {
  request: redux.PayloadActionCreator<TPayload, string>;
  success: redux.PayloadActionCreator<TData, string>;
  failure: redux.PayloadActionCreator<TError, string>;
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
      request(state: S | redux.Draft<S>): S | redux.Draft<S> {
        return {
          ...state,
          status: STATUS.fetching,
        };
      },

      success(state: S | redux.Draft<S>, action: redux.PayloadAction<TData>): S | redux.Draft<S> {
        return {
          ...state,
          data: action.payload,
          status: STATUS.success,
          fetchCount: (state.fetchCount ?? 0) + 1,
        };
      },

      failure(state: S | redux.Draft<S>, action: redux.PayloadAction<TError>): S | redux.Draft<S> {
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
    builder: Pick<redux.ActionReducerMapBuilder<RemoteDataState<TData, TError>>, 'addCase'>,
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
