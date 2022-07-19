import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  user: null | { id: string; name: string };
  currencies: null | Array<{ id: number; name: string }>;
}

const initialState: AppState = {
  user: null,
  currencies: null,
};

export const { actions, reducer } = createSlice({
  name: 'app',
  initialState,
  reducers: {
    userFetchDone(state, { payload }: PayloadAction<any>) {
      state.user = payload;
    },
    currenciesFetchDone(state, { payload }: PayloadAction<any>) {
      state.currencies = payload;
    },
  },
});

export const selectors = {
  user: (state: AppState) => state.user,
  currencies: (state: AppState) => state.currencies,
} as const;
