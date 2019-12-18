import { call, put } from 'redux-saga/effects';
import { Creators } from '../redux/actions/app';
import cacheResult from '../../../../src/helpers/saga/cache-result';

/**
 * Сага загрузки данных.
 * @param {Object} options Контекст приложения.
 * @param {Object} options.api Объект с методами для запроса данных по API.
 * @param {Object} options.cache Объект с методами для взаимодействия с кэшем.
 * @param {Object} options.sentry Логгер для ошибок.
 */
export function * getData ({ api, cache, sentry }) {
  const { ok, data } = yield call(cacheResult, {
    cache,
    key: 'data',
    args: [
      api.getData, {
        captureException: sentry.captureException,
      },
    ],
  });

  if (ok) {
    yield put(Creators.setCurrentData(data));
  }
}
