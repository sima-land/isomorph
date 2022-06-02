import type { Store } from '@reduxjs/toolkit';
import type { Logger } from '../logger/types';
import type { SagaRunner } from './types';
import createSagaMiddleware, { Saga, END } from 'redux-saga';
import { SentryError } from '../error-tracking';

/**
 * Возвращает новый runner для redux-saga.
 * @param logger Logger.
 * @return Runner.
 */
export function createSagaRunner(logger: Logger): SagaRunner {
  const middleware = createSagaMiddleware({
    onError: (error, { sagaStack }) => {
      logger.error(
        // @todo убрать отсюда упоминание sentry, вынести в провайдер, возможно заменить аргумент logger на onError
        new SentryError(error.message, {
          extra: { key: 'Saga stack', data: sagaStack },
        }),
      );
    },
  });

  return {
    middleware,

    // eslint-disable-next-line require-jsdoc, jsdoc/require-jsdoc
    prepare(store: Store, { timeout }: { timeout?: number } = {}) {
      return {
        // eslint-disable-next-line require-jsdoc, jsdoc/require-jsdoc
        async run<S extends Saga>(saga: S, ...args: Parameters<S>) {
          let ready = false;

          await Promise.race([
            // ждем пока сага выполнится
            middleware
              .run(saga, ...args)
              .toPromise()
              .then(() => {
                ready = true;
              }),

            // если сага не выполнилась за положенное время - прерываем
            typeof timeout === 'number' &&
              Number.isFinite(timeout) &&
              new Promise<void>(resolve => {
                setTimeout(() => {
                  if (!ready) {
                    logger.error(Error(`Сага прервана по таймауту (${timeout} миллисекунд)`));
                    store.dispatch(END);
                  }
                  resolve();
                }, timeout);
              }),
          ]);
        },
      };
    },
  };
}
