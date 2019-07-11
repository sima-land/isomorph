import { all, takeLatest, put } from 'redux-saga/effects';
import { Types, Creators as appCreators } from '../redux/actions/app';
import { initDataLoading, loadData } from './app';

/**
 * Функция для создания инициализирующей саги.
 * @param {Object} options Опции, необходимые для запуска дочерних саг.
 * @return {Function} Инициализирующая сага.
 */
export const createRootSaga = (options = {}) => function* () {
  yield all([
    takeLatest(Types.START_APP, initDataLoading, options),
    takeLatest(Types.INIT_DATA_LOADING, loadData, options),
  ]);
  yield put(appCreators.startApp());
};
