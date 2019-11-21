import prepareOnReady from './prepare-on-ready';

/**
 * Наблюдатель за готовностью стора.
 * @param {Object} store Стор.
 * @param {Function} isReady Функция определения готовности стора.
 * @param {Function} onReady Функция обработчик события готовности стора.
 * @param {number} timeout Максимальное время, отведённое на ожидание готовности стора.
 * @return {Object} Стор.
 */
const waitOnStoreReadiness = (
  store,
  isReady,
  onReady,
  timeout = 2 ** 30,
) => {
  let timer = null;
  onReady = prepareOnReady(
    store,
    store.subscribe(
      () => {
        isReady(store) && onReady(timer);
      }
    ),
    onReady
  );
  timer = setTimeout(
    onReady,
    timeout
  );
  return store;
};

export default waitOnStoreReadiness;