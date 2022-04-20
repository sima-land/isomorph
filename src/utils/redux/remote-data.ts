import type { PayloadAction, Draft } from '@reduxjs/toolkit';

export type Status = 'initial' | 'fetching' | 'success' | 'failure';

export interface RemoteDataState<TData, TError> {
  data: TData;
  error: TError;
  status: Status;
}

export const STATUS: Record<Status, Status> = {
  initial: 'initial',
  fetching: 'fetching',
  success: 'success',
  failure: 'failure',
};

/**
 * Возвращает набор обработчиков для работы с удаленными данными.
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
