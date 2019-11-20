import { createReducer, createStateMaker } from '../remote-data';
import { STATUSES } from '../constants';

describe('createStateMaker()', () => {
  it('should return state maker without arguments', () => {
    const createState = createStateMaker();
    expect(createState()).toEqual({
      status: STATUSES.initial,
    });
    expect(createState()).toEqual({
      status: STATUSES.initial,
    });
  });
  it('should return maker which passes status in state', () => {
    const createState = createStateMaker({
      id: 123,
      testState: true,
    });
    expect(createState()).toEqual({
      id: 123,
      testState: true,
      status: STATUSES.initial,
    });
  });
  it('should handle options.createStatusAdder', () => {
    const createState = createStateMaker({
      id: 234,
      testState: true,
    }, {
      createStatusAdder: status => state => ({
        ...state,
        dataState: status,
      }),
    });
    expect(createState()).toEqual({
      id: 234,
      testState: true,
      dataState: STATUSES.initial,
    });
  });
});

describe('createReducer', () => {
  /**
   * Тестовый callback.
   * @param {Object} wrappers Обертки.
   * @param {Object} handlers Обработчики.
   * @return {Function} Reducer.
   */
  const createTestHandlers = (wrappers, handlers) => ({
    PURE_FETCH: handlers.request,
    PURE_SUCCESS: handlers.success,
    PURE_FAILURE: handlers.failure,
    FETCH: wrappers.asRequest((state, action) => ({ ...state, query: action.query })),
    SUCCESS: wrappers.asSuccess((state, action) => ({ ...state, user: action.user })),
    FAILURE: wrappers.asFailure((state, action) => ({ ...state, error: action.error })),
  });
  it('should pass wrappers and handlers to second argument function', () => {
    const spy = jest.fn(createTestHandlers);
    createReducer({}, spy);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(typeof spy.mock.calls[0][0].asInitial).toBe('function');
    expect(typeof spy.mock.calls[0][0].asRequest).toBe('function');
    expect(typeof spy.mock.calls[0][0].asSuccess).toBe('function');
    expect(typeof spy.mock.calls[0][0].asFailure).toBe('function');

    expect(typeof spy.mock.calls[0][1].initial).toBe('function');
    expect(typeof spy.mock.calls[0][1].request).toBe('function');
    expect(typeof spy.mock.calls[0][1].success).toBe('function');
    expect(typeof spy.mock.calls[0][1].failure).toBe('function');
  });
  it('should return properly worked reducer', () => {
    const reducer = createReducer({}, createTestHandlers);
    const initialState = {
      query: null,
      user: null,
      error: null,
    };
    expect(reducer(initialState, { type: 'PURE_FETCH' })).toEqual({
      query: null,
      user: null,
      error: null,
      status: STATUSES.fetching,
    });
    expect(reducer(initialState, { type: 'PURE_SUCCESS' })).toEqual({
      query: null,
      user: null,
      error: null,
      status: STATUSES.success,
    });
    expect(reducer(initialState, { type: 'PURE_FAILURE' })).toEqual({
      query: null,
      user: null,
      error: null,
      status: STATUSES.failure,
    });
    expect(reducer(initialState, { type: 'FETCH', query: 'name=John' })).toEqual({
      query: 'name=John',
      user: null,
      error: null,
      status: STATUSES.fetching,
    });
    expect(reducer(initialState, { type: 'SUCCESS', user: { id: 1, name: 'John' } })).toEqual({
      query: null,
      user: { id: 1, name: 'John' },
      error: null,
      status: STATUSES.success,
    });
    expect(reducer(initialState, { type: 'FAILURE', error: 'no users' })).toEqual({
      query: null,
      user: null,
      error: 'no users',
      status: STATUSES.failure,
    });
  });
});
