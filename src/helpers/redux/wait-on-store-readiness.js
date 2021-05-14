import prepareOnReady from './prepare-on-ready';
import isFunction from 'lodash/isFunction';

/**
 * Наблюдатель за готовностью стора.
 * @param {Object} store Стор.
 * @param {Function} isReady Функция определения готовности стора.
 * @param {Function} onReady Функция обработчик события готовности стора.
 * @param {Function} onTimeout Функция обработчик события таймаута ожидания готовности стора.
 * @param {number} timeout Максимальное время, отведённое на ожидание готовности стора.
 * @return {Object} Стор.
 */
const waitOnStoreReadiness = (
  store,
  isReady,
  onReady,
  onTimeout,
  timeout = 2 ** 30
) => {
  let timer = null;
  const wrapperOnReady = prepareOnReady(
    store,
    store.subscribe(
      () => {
        isReady(store) && wrapperOnReady(timer);
      }
    ),
    onReady
  );
  timer = setTimeout(
    () => {
      wrapperOnReady();
      isFunction(onTimeout) && onTimeout(store);
    },
    timeout
  );
  return store;
};

export default waitOnStoreReadiness;
