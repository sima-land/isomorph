import type { Saga, SagaMiddleware } from 'redux-saga';
import type { Store } from '@reduxjs/toolkit';

export interface SagaRunner {
  middleware: SagaMiddleware<any>;

  prepare: (
    store: Store,
    options?: { timeout?: number },
  ) => {
    run: <S extends Saga>(saga: S, ...args: Parameters<S>) => Promise<void>;
  };
}
