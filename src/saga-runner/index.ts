import type { Store } from '@reduxjs/toolkit';
import type { Logger } from '../logger/types';
import type { SagaRunner } from './types';
import createSagaMiddleware, { Saga, END } from 'redux-saga';

/**
 * Возвращает новый runner для redux-saga.
 * @param logger Logger.
 * @return Runner.
 */
export function createSagaRunner(logger: Logger): SagaRunner {
  const middleware = createSagaMiddleware({
    onError: error => {
      // @todo сделать что-то вроде new SentryError({ context, meta, level })
      logger.error(error);
    },
  });

  return {
    middleware,

    // eslint-disable-next-line require-jsdoc, jsdoc/require-jsdoc
    prepare(store: Store, { timeout = 1000 }: { timeout?: number } = {}) {
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
            new Promise<void>(resolve => {
              setTimeout(() => {
                if (!ready) {
                  logger.error(Error('Сага прервана по таймауту'));
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
