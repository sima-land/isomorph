import { put, take, delay } from 'redux-saga/effects';
import { Types as appTypes, Creators as appCreators } from '../redux/actions/app';

/**
 * Инициализирует загрузку данных для рендеринга.
 */
export function* initDataLoading () {
  yield put(appCreators.initDataLoading());
  const { data } = yield take(appTypes.SET_CURRENT_DATA);
  if (data && data.output) {
    yield put(appCreators.finishLoading());
  }
}

/**
 * Загружает данные для рендеринга.
 */
export function* loadData () {
  yield delay(Math.floor(Math.random() * (2000 - 10)) + 10);
  yield put(appCreators.setCurrentData(
    {
      output: 'Hello World!',
    }
  ));
}
