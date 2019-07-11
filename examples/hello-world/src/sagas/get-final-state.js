import { createService } from '../../../../src/container';

/**
 * Функция для получения стейта.
 * @param {Object} store Стор.
 * @param {Function} runSaga Функция для запуска саг в приложении.
 * @return {Object} Стейт приложения.
 */
export const getState = async (
  store,
  runSaga,
) => {
  await runSaga();
  return store.getState();
};

export const getStateService = createService(
  getState,
  (
    {
      store: {
        store,
        runSaga,
      },
    }
  ) => [store, runSaga]
);
