import { put, take, call } from 'redux-saga/effects';
import { Types as appTypes, Creators as appCreators } from '../redux/actions/app';

const axiosParams = {
  params: {
    fields: 'name',
  },
};

/**
 * Инициализирует загрузку данных для рендеринга.
 */
export function * initDataLoading () {
  yield put(appCreators.initDataLoading());
  const { data } = yield take(appTypes.SET_CURRENT_DATA);
  if (data && data.output) {
    yield put(appCreators.finishLoading());
  }
}

/**
 * Загружает данные для рендеринга.
 * @param {Object} options Опции.
 * @param {Object} options.axiosInstance Инстанс axios.
 */
export function * loadData ({ axiosInstance }) {
  const response = yield call(axiosInstance.get, '/item/123456/', axiosParams);
  yield put(appCreators.setCurrentData(
    {
      output: `Hello World! Данные из запроса к API: ${response.data.name}`,
    }
  ));
}
