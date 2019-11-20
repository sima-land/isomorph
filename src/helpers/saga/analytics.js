import { call } from 'redux-saga/effects';
import isObject from 'lodash/isObject';
import isFunction from 'lodash/isFunction';

/**
 * Определяет существует ли око.
 * @return {boolean} Да/нет.
 */
export const checkOkoExists = () =>
  typeof window !== 'undefined' && isObject(window.oko) && isFunction(window.oko.push);

/**
 * Отправка аналитики в око.
 * @param {Object} meta Данные для отправки.
 */
export function* sendAnalytics ({ meta }) {
  const isOkoExists = yield call(checkOkoExists);
  const metaIsObject = yield call(isObject, meta);

  if (isOkoExists && metaIsObject) {
    yield call([window.oko, 'push'], meta);
  }
}
