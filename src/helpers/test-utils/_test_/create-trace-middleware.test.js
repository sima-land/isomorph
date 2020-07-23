import { createStore, applyMiddleware } from 'redux';
import createTraceMiddleware from '../create-trace-middleware';
import identity from 'lodash/identity';
import isFunction from 'lodash/isFunction';

describe('createTraceMiddleware()', () => {
  it('should works properly', () => {
    const traceMiddleware = createTraceMiddleware();
    const testStore = createStore(identity, null, applyMiddleware(traceMiddleware));

    expect(isFunction(traceMiddleware.reset)).toBe(true);
    expect(traceMiddleware.dispatchedActions).toEqual([]);

    testStore.dispatch({ type: 'FIRST' });
    testStore.dispatch({ type: 'SECOND' });
    testStore.dispatch({ type: 'THIRD' });

    expect(traceMiddleware.dispatchedActions).toEqual([
      { type: 'FIRST' },
      { type: 'SECOND' },
      { type: 'THIRD' },
    ]);

    traceMiddleware.reset();

    expect(traceMiddleware.dispatchedActions).toEqual([]);
  });
});
