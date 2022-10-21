import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Status } from '@sima-land/isomorph/utils/redux/remote-data';

interface User {
  id: string;
  name: string;
}

interface Currency {
  id: number;
  name: string;
}

interface AppState {
  user: {
    data: null | User;
    status: Status;
    error?: string;
  };
  currencies: {
    data: null | Currency[];
    status: Status;
    error?: string;
  };
}

const initialState: AppState = {
  user: {
    status: 'initial',
    data: null,
  },
  currencies: {
    status: 'initial',
    data: null,
  },
};

export const { actions, reducer } = createSlice({
  name: 'app',
  initialState,
  reducers: {
    userFetchDone(state, { payload }: PayloadAction<User>) {
      state.user.status = 'success';
      state.user.data = payload;
    },
    userFetchFail(state, { payload }: PayloadAction<string>) {
      state.user.status = 'failure';
      state.user.error = payload;
    },
    currenciesFetchDone(state, { payload }: PayloadAction<Currency[]>) {
      state.currencies.status = 'success';
      state.currencies.data = payload;
    },
    currenciesFetchFail(state, { payload }: PayloadAction<string>) {
      state.currencies.status = 'failure';
      state.currencies.error = payload;
    },
  },
});

export const selectors = {
  user: (state: AppState) => state.user,
  currencies: (state: AppState) => state.currencies,
} as const;
