import type { Middleware } from '@reduxjs/toolkit';
import type { Saga, SagaMiddlewareOptions } from 'redux-saga';

export type SagaErrorInfo = Parameters<Required<SagaMiddlewareOptions>['onError']>[1];

export interface SagaInterruptInfo {
  timeout: number;
}

export interface SagaExtendedMiddleware extends Middleware {
  timeout(milliseconds: number): this;
  run: <S extends Saga>(saga: S, ...args: Parameters<S>) => Promise<void>;
}

export interface SagaMiddlewareHandler {
  onSagaError(error: Error, errorInfo: SagaErrorInfo): Promise<void> | void;
  onConfigError(error: Error): Promise<void> | void;
  onTimeoutInterrupt(info: SagaInterruptInfo): Promise<void> | void;
}
