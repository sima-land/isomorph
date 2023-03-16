import { call, put, takeLatest } from 'redux-saga/effects';
import { HttpApi } from '../types';
import { User } from '../reducers/user';
import { Currency } from '../reducers/currency';

export interface SagaOptions {
  api: HttpApi;
}

export function* rootSaga(options: SagaOptions): Generator<any, void, any> {
  yield takeLatest(User.actions.fetch, fetchUser, options);
  yield takeLatest(Currency.actions.fetch, fetchCurrencies, options);

  yield put(User.actions.fetch());
  yield put(Currency.actions.fetch());
}

function* fetchUser({ api }: SagaOptions) {
  const response: Awaited<ReturnType<typeof api.getUser>> = yield call(api.getUser);

  if (response.ok) {
    yield put(User.actions.fetchDone(response.data.items[0]));
  } else {
    yield put(User.actions.fetchFail(String(response.error)));
  }
}

function* fetchCurrencies({ api }: SagaOptions) {
  const response: Awaited<ReturnType<typeof api.getCurrencies>> = yield call(api.getCurrencies);

  if (response.ok) {
    yield put(Currency.actions.fetchDone(response.data.items));
  } else {
    yield put(Currency.actions.fetchFail(String(response.error)));
  }
}
