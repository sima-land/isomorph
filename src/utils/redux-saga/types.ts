import type { Middleware } from '@reduxjs/toolkit';
import type { Saga, SagaMiddlewareOptions } from 'redux-saga';

/** Опции остановки redux-saga. */
export interface SagaInterruptConfig {
  strategy?: 'dispatch-end' | 'cancel-task';
}

/** Информация, которая приходит вторым аргументом в обработчик ошибки SagaMiddleware. */
export type SagaErrorInfo = Parameters<Required<SagaMiddlewareOptions>['onError']>[1];

/** Информация об остановке redux-saga. */
export interface SagaInterruptInfo {
  timeout: number;
}

/** Опции запуска redux-saga с остановкой по таймауту. */
export interface SagaTimeoutRunData<S extends Saga> {
  saga: S;
  args: Parameters<S>;
  timeout: number;
}

/** Кастомная версия SagaMiddleware. */
export interface SagaExtendedMiddleware extends Middleware {
  /**
   * Установить временное ограничение работы саги.
   * Если сага не успела выполнится до истечения этого ограничения она будет принудительно завершена.
   */
  timeout(milliseconds: number, config?: SagaInterruptConfig): this;

  /**
   * Запускает сагу.
   */
  run: <S extends Saga>(saga: S, ...args: Parameters<S>) => Promise<void>;
}

/** Обработчик событий SagaExtendedMiddleware. */
export interface SagaMiddlewareHandler {
  onSagaError(error: Error, errorInfo: SagaErrorInfo): Promise<void> | void;
  onConfigError(error: Error): Promise<void> | void;
  onTimeoutInterrupt(info: SagaInterruptInfo): Promise<void> | void;
}
