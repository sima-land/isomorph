import { createSlice } from '@reduxjs/toolkit';
import { createRemoteDataReducers, RemoteDataState, STATUS } from '../remote-data';

interface TestState extends RemoteDataState<number, string> {
  foo: 'bar';
}

describe('createGenericSlice', () => {
  const initialState: TestState = {
    data: 0,
    error: '',
    status: STATUS.initial,
    foo: 'bar',
  };

  const { reducer, actions } = createSlice({
    name: 'user',
    initialState,
    reducers: createRemoteDataReducers<TestState>(),
  });

  it('should handle request action', () => {
    const actual = reducer(initialState, actions.request());

    expect(actual).toEqual({
      ...initialState,
      status: STATUS.fetching,
    });
  });

  it('should handle success action', () => {
    const actual = reducer(initialState, actions.success(234));

    expect(actual).toEqual({
      ...initialState,
      data: 234,
      status: STATUS.success,
    });
  });

  it('should handle failure action', () => {
    const actual = reducer(initialState, actions.failure('error message here'));

    expect(actual).toEqual({
      ...initialState,
      error: 'error message here',
      status: STATUS.failure,
    });
  });
});
