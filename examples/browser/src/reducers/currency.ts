import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Status } from '@sima-land/isomorph/utils/redux/remote-data';
import { CurrencyData } from '../types';

export interface CurrencyState {
  data: null | CurrencyData[];
  status: Status;
  error?: string;
}

const initialState: CurrencyState = {
  status: 'initial',
  data: null,
};

export const { actions, reducer } = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    fetch(state) {
      state.status = 'fetching';
    },
    fetchDone(state, { payload }: PayloadAction<CurrencyData[]>) {
      state.status = 'success';
      state.data = payload;
    },
    fetchFail(state, { payload }: PayloadAction<string>) {
      state.status = 'failure';
      state.error = payload;
    },
  },
});

export const Currency = {
  actions,
  reducer,
};
