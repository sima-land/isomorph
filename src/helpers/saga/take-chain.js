import { delay, fork, put, race, take } from 'redux-saga/effects';
import propEq from 'lodash/fp/propEq';
import now from 'lodash/now';

/**
 * Накапливает экшены и генерирует эффект по таймауту.
 * @param {number} timeout Время задержки в мс.
 * @param {Array} types Массив с типами экшенов.
 * @param {Function} task Генератор.
 * @param {...*} args Аргументы для генератора.
 * @return {Object} Эффект.
 */
export const takeChain = (timeout, types, task, ...args) =>
  fork(generateTakeChain, timeout, types, task, ...args);

/**
 * Генерирует эффект по таймауту.
 * @param {number} timeout Время задержки в мс.
 * @param {Array} types Массив с типами экшенов.
 * @param {Function} task Генератор.
 * @param {...*} args Аргументы для генератора.
 */
export function * generateTakeChain (timeout, types, task, ...args) {
  while (true) {
    const BREAK_TYPE = `BREAK_${now()}`;
    const collectedActions = [yield take(types)];

    yield fork(putDelayed, timeout, BREAK_TYPE);

    while (true) {
      const { action, canceled } = yield race({
        action: take(types),
        canceled: take(BREAK_TYPE),
      });

      action && collectedActions.push(action);
      if (canceled || types.every(type => collectedActions.some(propEq('type', type)))) {
        yield fork(task, ...args, collectedActions);
        break;
      }
    }
  }
}

/**
 * Вызывает экшен с заданной задержкой.
 * @param {number} timeout Время задержки в мс.
 * @param {string} type Тип экшена.
 */
export function * putDelayed (timeout, type) {
  yield delay(timeout);
  yield put({ type });
}
