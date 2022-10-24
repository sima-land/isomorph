/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */
import { MiddlewareAPI } from '@reduxjs/toolkit';
import { SagaExtendedMiddleware } from './types';
import { Logger } from '../../logger';
import createSagaMiddleware, { END, Saga } from 'redux-saga';
import { SentryError } from '../../error-tracking';

/**
 * Возвращает расширенную версию SagaMiddleware.
 * @param logger Logger.
 * @return Middleware.
 */
function createSagaExtendedMiddleware(logger: Logger): SagaExtendedMiddleware {
  const privates: {
    api?: MiddlewareAPI;
    timeout?: number;
  } = {};

  const sagaMiddleware = createSagaMiddleware({
    onError: (error, { sagaStack }) => {
      logger.error(
        // @todo убрать отсюда упоминание sentry, вынести в провайдер, возможно заменить аргумент logger на onError
        new SentryError(error.message, {
          extra: {
            key: 'Saga stack',
            data: sagaStack,
          },
        }),
      );
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
    let timerId: NodeJS.Timeout;

    if (!api) {
      throw Error('Middleware is not applied to the store');
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
              logger.error(Error(`Сага прервана по таймауту (${timeout} миллисекунд)`));
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
