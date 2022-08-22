import { END } from 'redux-saga';
import { call, put, all } from 'redux-saga/effects';
import { Api } from '../services/api';
import { actions } from '../reducers/app';

export interface SagaOptions {
  api: Api;
}

export function* rootSaga(options: SagaOptions): Generator<any, void, any> {
  // делаем два параллельных запроса
  yield all([call(fetchUser, options), call(fetchCurrencies, options)]);

  // завершаем сагу
  yield put(END);
}

function* fetchUser({ api }: SagaOptions) {
  const response: Awaited<ReturnType<typeof api.getUser>> = yield call(api.getUser);

  if (response.ok) {
    yield put(actions.userFetchDone(response.data.items[0]));
  } else {
    yield put(actions.userFetchDone({ name: 'Unknown' }));
  }
}

function* fetchCurrencies({ api }: SagaOptions) {
  const response: Awaited<ReturnType<typeof api.getCurrencies>> = yield call(api.getCurrencies);

  if (response.ok) {
    yield put(actions.currenciesFetchDone(response.data.items));
  } else {
    yield put(actions.currenciesFetchDone([]));
  }
}
