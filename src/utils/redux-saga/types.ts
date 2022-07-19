import type { Middleware } from '@reduxjs/toolkit';
import type { Saga } from 'redux-saga';

export interface SagaExtendedMiddleware extends Middleware {
  timeout(milliseconds: number): this;
  run: <S extends Saga>(saga: S, ...args: Parameters<S>) => Promise<void>;
}
