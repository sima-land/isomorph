/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { MiddlewareAPI } from '@reduxjs/toolkit';
import { SagaExtendedMiddleware, SagaMiddlewareHandler } from './types';
import createSagaMiddleware, { END, Saga } from 'redux-saga';

/**
 * Возвращает расширенную версию SagaMiddleware.
 * @param handler Обработчик событий.
 * @return Middleware.
 */
function createSagaExtendedMiddleware(handler: SagaMiddlewareHandler): SagaExtendedMiddleware {
  const privates: {
    api?: MiddlewareAPI;
    timeout?: number;
  } = {};

  const sagaMiddleware = createSagaMiddleware({
    onError: (error, info) => {
      handler.onSagaError(error, info);
    },
  });

  const middleware: SagaExtendedMiddleware = api => {
    privates.api = api;
    return sagaMiddleware(api);
  };

  middleware.timeout = function timeout(milliseconds: number) {
    privates.timeout = milliseconds;
    return middleware;
  };

  middleware.run = async function run<S extends Saga>(
    saga: S,
    ...args: Parameters<S>
  ): Promise<void> {
    const { api, timeout } = privates;
    const promises: Promise<void>[] = [];

    let ready = false;
    let timerId: ReturnType<typeof setTimeout>;

    if (!api) {
      const error = new Error('Middleware is not applied to the store');

      handler.onConfigError(error);

      throw error;
    }

    promises.push(
      sagaMiddleware
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

    if (typeof timeout === 'number' && Number.isFinite(timeout)) {
      promises.push(
        new Promise<void>(resolve => {
          timerId = setTimeout(() => {
            if (!ready) {
              handler.onTimeoutInterrupt({ timeout });
              api.dispatch(END);
            }

            resolve();
          }, timeout);
        }),
      );
    }

    await Promise.race(promises);
  };

  return middleware;
}

export { createSagaExtendedMiddleware as createSagaMiddleware };
