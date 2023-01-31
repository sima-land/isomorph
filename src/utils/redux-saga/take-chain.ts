import { Action } from '@reduxjs/toolkit';
import { delay, fork, put, race, take } from 'redux-saga/effects';

/**
 * Накапливает экшены и генерирует эффект по таймауту.
 * @param timeout Время задержки в мс.
 * @param types Массив с типами ожидаемых экшенов.
 * @param task Генератор.
 * @param deps Аргументы для генератора.
 * @return Эффект.
 */
export function takeChain<
  Deps extends any[],
  Task extends (...someArgs: [...Deps, Action[]]) => any,
>(timeout: number, types: string[], task: Task, ...deps: Deps) {
  return fork(generateTakeChain as any, timeout, types, task, deps);
}

/**
 * Генерирует эффект по таймауту.
 * @internal
 * @param timeout Время задержки в мс.
 * @param types Массив с типами ожидаемых экшенов.
 * @param task Генератор.
 * @param deps Аргументы для генератора.
 */
export function* generateTakeChain<
  Deps extends any[],
  Task extends (...someArgs: [...Deps, Action[]]) => any,
>(timeout: number, types: string[], task: Task, deps: Deps): Generator<any, void, any> {
  while (true) {
    const breakAction: Action = { type: `BREAK_${Date.now()}` };
    const firstAction: Action = yield take(types);
    const collectedActions = [firstAction];

    yield fork(putDelayed, timeout, breakAction);

    while (true) {
      const { action, canceled } = yield race({
        action: take(types),
        canceled: take(breakAction.type),
      });

      action && collectedActions.push(action);

      if (
        canceled ||
        types.every(type => collectedActions.some(someAction => someAction.type === type))
      ) {
        // @todo убрать "as any"
        yield fork(task as any, ...deps, collectedActions);
        break;
      }
    }
  }
}

/**
 * Вызывает экшен с заданной задержкой.
 * @internal
 * @param timeout Время задержки в мс.
 * @param action Тип экшена.
 */
export function* putDelayed(timeout: number, action: Action) {
  yield delay(timeout);
  yield put(action);
}
