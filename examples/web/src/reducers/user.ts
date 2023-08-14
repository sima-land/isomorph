import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Status } from '@sima-land/isomorph/utils/redux';
import { UserData } from '../types';

export interface UserState {
  data: null | UserData;
  status: Status;
  error?: string;
}

const initialState: UserState = {
  status: 'initial',
  data: null,
};

const { actions, reducer } = createSlice({
  name: 'user',
  initialState,
  reducers: {
    fetch(state) {
      state.status = 'fetching';
    },
    fetchDone(state, { payload }: PayloadAction<UserData>) {
      state.status = 'success';
      state.data = payload;
    },
    fetchFail(state, { payload }: PayloadAction<string>) {
      state.status = 'failure';
      state.error = payload;
    },
  },
});

export const User = { actions, reducer } as const;
