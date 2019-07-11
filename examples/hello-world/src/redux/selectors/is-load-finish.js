import isLoaded from './is-loaded';

/**
 * Определяет завершена ли загрузка необходимых данных в приложении.
 * @param {Object} store Стор.
 * @return {boolean} Возвращает true, если загрузка завершена.
 */
function isLoadFinish (store) {
  return isLoaded(store.getState());
}

export default isLoadFinish;
