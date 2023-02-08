/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { MiddlewareAPI } from '@reduxjs/toolkit';
import {
  SagaExtendedMiddleware,
  SagaInterruptConfig,
  SagaMiddlewareHandler,
  SagaTimeoutRunData,
} from './types';
import createSagaMiddleware, { END, Saga, Task, SagaMiddleware } from 'redux-saga';
import { call, cancel, delay, fork, race } from 'redux-saga/effects';

/**
 * Возвращает расширенную версию SagaMiddleware.
 * @param handler Обработчик событий.
 * @return Middleware.
 */
function createSagaExtendedMiddleware(handler: SagaMiddlewareHandler): SagaExtendedMiddleware {
  return new MiddlewareControl(handler).toMiddleware();
}

class MiddlewareControl {
  private api?: MiddlewareAPI;
  private interruptTimeout?: number;
  private interruptStrategy?: SagaInterruptConfig['strategy'];
  private handler: SagaMiddlewareHandler;
  private sagaMiddleware: SagaMiddleware;

  constructor(handler: SagaMiddlewareHandler) {
    this.handler = handler;

    this.sagaMiddleware = createSagaMiddleware({
      onError: (error, info) => {
        handler.onSagaError(error, info);
      },
    });
  }

  public toMiddleware(): SagaExtendedMiddleware {
    const middleware: SagaExtendedMiddleware = api => {
      this.api = api;
      return this.sagaMiddleware(api);
    };

    middleware.timeout = (milliseconds, config) => {
      this.configInterrupt(milliseconds, config);
      return middleware;
    };

    middleware.run = async <S extends Saga>(saga: S, ...args: Parameters<S>) => {
      await this.run(saga, ...args);
    };

    return middleware;
  }

  private configInterrupt(milliseconds: number, config?: SagaInterruptConfig) {
    this.interruptTimeout = milliseconds;
    this.interruptStrategy = config?.strategy ?? 'dispatch-end';
  }

  private async run<S extends Saga>(saga: S, ...args: Parameters<S>): Promise<void> {
    const { interruptTimeout } = this;

    if (typeof interruptTimeout === 'number' && Number.isFinite(interruptTimeout)) {
      switch (this.interruptStrategy) {
        case 'cancel-task':
          await this.runWithBreakTask({ saga, args, timeout: interruptTimeout });
          return;
        case 'dispatch-end':
          await this.runWithBreakMiddleware({ saga, args, timeout: interruptTimeout });
          return;
      }
    }

    await this.sagaMiddleware.run(saga, ...args).toPromise();
  }

  private async runWithBreakTask<S extends Saga>(data: SagaTimeoutRunData<S>): Promise<void> {
    try {
      await this.sagaMiddleware.run(runWithTimeLimit, data).toPromise();
    } catch (error) {
      if (error instanceof TimeoutInterruptError) {
        this.handler.onTimeoutInterrupt({ timeout: data.timeout });
      } else {
        throw error;
      }
    }
  }

  private async runWithBreakMiddleware<S extends Saga>(data: SagaTimeoutRunData<S>): Promise<void> {
    const { saga, args, timeout } = data;
    const { api } = this;

    if (!api) {
      const error = new Error('Middleware is not applied to the store');

      this.handler.onConfigError(error);

      throw error;
    }

    const promises: Promise<void>[] = [];

    let ready = false;
    let timerId: ReturnType<typeof setTimeout>;

    promises.push(
      this.sagaMiddleware
        .run(saga, ...args)
        .toPromise()
        .then(() => {
          ready = true;
        })
        .finally(() => {
          // вне зависимости от результата отключаем таймер если он есть
          timerId !== undefined && clearTimeout(timerId);
        }),
    );

    promises.push(
      new Promise<void>(resolve => {
        timerId = setTimeout(() => {
          if (!ready) {
            this.handler.onTimeoutInterrupt({ timeout });
            api.dispatch(END);
          }

          resolve();
        }, timeout);
      }),
    );

    await Promise.race(promises);
  }
}

function* runWithTimeLimit<S extends Saga>(
  data: SagaTimeoutRunData<S>,
): Generator<any, ReturnType<S>, any> {
  const { saga, args, timeout } = data;
  const task: Task = yield fork(saga, ...args);

  const [isTimeout, taskResult]: [boolean, ReturnType<S>] = yield race([
    delay(timeout, true),
    call(() => task.toPromise()),
  ]);

  if (isTimeout) {
    yield cancel(task);
    throw new TimeoutInterruptError();
  }

  return taskResult;
}

class TimeoutInterruptError extends Error {
  constructor() {
    super('Saga was cancelled by timeout');
  }
}

export { createSagaExtendedMiddleware as createSagaMiddleware };
