import { createReducer, createSlice } from '@reduxjs/toolkit';
import { STATUS, RemoteData, RemoteDataState } from '..';

type TestSliceState = RemoteDataState<number, string | null>;

describe('RemoteData.STATUS', () => {
  it('should be constant of status', () => {
    expect(RemoteData.STATUS).toBe(STATUS);
  });
});

describe('RemoteData.createActions', () => {
  it('should create action creators', () => {
    const actions = RemoteData.createActions<{ id: number }, string, number>('test-reducer');

    expect(actions.request(123)).toEqual({
      type: 'test-reducer/request',
      payload: 123,
    });

    expect(actions.success({ id: 123 })).toEqual({
      type: 'test-reducer/success',
      payload: { id: 123 },
    });

    expect(actions.failure('error!')).toEqual({
      type: 'test-reducer/failure',
      payload: 'error!',
    });
  });
});

describe('RemoteData.createHandlers', () => {
  it('should works with createSlice', () => {
    const initialState: TestSliceState = {
      data: 0,
      status: STATUS.initial,
      error: null,
    };

    const slice = createSlice({
      name: 'test',
      initialState,
      reducers: {
        ...RemoteData.createHandlers<number, string | null>(),
      },
    });

    expect(slice.reducer(initialState, slice.actions.request())).toEqual({
      ...initialState,
      status: STATUS.fetching,
    });

    expect(slice.reducer(initialState, slice.actions.success(23))).toEqual({
      ...initialState,
      data: 23,
      status: STATUS.success,
      fetchCount: 1,
    });

    expect(slice.reducer(initialState, slice.actions.failure('test error'))).toEqual({
      ...initialState,
      error: 'test error',
      status: STATUS.failure,
      fetchCount: 1,
    });
  });
});

interface TestReducerState extends RemoteDataState<{ name: string } | null, string | null> {
  type: 'test-reducer-state';
}

describe('RemoteData.applyHandlers', () => {
  it('should apply handlers by builder', () => {
    const initialState: TestReducerState = {
      type: 'test-reducer-state',
      data: null,
      error: null,
      status: 'initial',
    };

    const actions = {
      ...RemoteData.createActions<TestReducerState['data'], string | null>('test-reducer'),
    };

    const reducer = createReducer<TestReducerState>(initialState, builder => {
      RemoteData.applyHandlers(actions, builder);
    });

    expect(reducer(initialState, actions.request())).toEqual({
      ...initialState,
      status: 'fetching',
    });

    expect(reducer(initialState, actions.success({ name: 'Jason' }))).toEqual({
      ...initialState,
      data: { name: 'Jason' },
      status: 'success',
      fetchCount: 1,
    });

    expect(reducer(initialState, actions.failure('Restriction'))).toEqual({
      ...initialState,
      error: 'Restriction',
      status: 'failure',
      fetchCount: 1,
    });
  });
});

interface TestSelectorsState extends RemoteDataState<boolean, number> {
  type: 'test-selectors-state';
}

describe('RemoteData.createSelectors', () => {
  it('should create selectors', () => {
    const initialState: TestSelectorsState = {
      data: false,
      error: 0,
      status: 'initial',
      type: 'test-selectors-state',
    };

    const selectors = RemoteData.createSelectors<TestSelectorsState, TestSelectorsState>(
      (state: TestSelectorsState) => state,
    );

    expect(selectors.isInitial(initialState)).toBe(true);
    expect(selectors.isFetching(initialState)).toBe(false);
    expect(selectors.isSuccess(initialState)).toBe(false);
    expect(selectors.isFailed(initialState)).toBe(false);
    expect(selectors.wasFetched(initialState)).toBe(false);

    const fetchingState: TestSelectorsState = {
      ...initialState,
      status: 'fetching',
    };

    expect(selectors.isInitial(fetchingState)).toBe(false);
    expect(selectors.isFetching(fetchingState)).toBe(true);
    expect(selectors.isSuccess(initialState)).toBe(false);
    expect(selectors.isFailed(fetchingState)).toBe(false);
    expect(selectors.wasFetched(fetchingState)).toBe(false);

    const doneState: TestSelectorsState = {
      ...initialState,
      status: 'success',
      data: true,
      fetchCount: 94,
    };

    expect(selectors.isInitial(doneState)).toBe(false);
    expect(selectors.isFetching(doneState)).toBe(false);
    expect(selectors.isSuccess(doneState)).toBe(true);
    expect(selectors.isFailed(doneState)).toBe(false);
    expect(selectors.wasFetched(doneState)).toBe(true);

    const failState: TestSelectorsState = {
      ...initialState,
      status: 'failure',
      data: false,
      fetchCount: 2,
    };

    expect(selectors.isInitial(failState)).toBe(false);
    expect(selectors.isFetching(failState)).toBe(false);
    expect(selectors.isSuccess(failState)).toBe(false);
    expect(selectors.isFailed(failState)).toBe(true);
    expect(selectors.wasFetched(failState)).toBe(true);
  });
});
