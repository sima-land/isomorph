import { identity } from 'lodash';

interface SafetyDoneInfo<T> {
  ok: true;
  result: T;
}

interface SafetyFailInfo {
  ok: false;
  error: unknown;
}

export type SafetyInfo<T> = SafetyDoneInfo<T> | SafetyFailInfo;

interface SafetyFormatter<T, F> {
  (info: SafetyInfo<T>): F | Promise<F>;
}

/**
 * Возвращает функцию, результатом которой является promise, который никогда не переходит в состояние rejected.
 * При перехвате исключения результат будет содержать ошибку.
 * @param fn Оборачиваемая функция.
 * @return Функция.
 */
export function safetyAsync<T, P extends any[]>(
  fn: (...args: P) => Promise<T>,
): (...args: P) => Promise<SafetyInfo<T>>;

/**
 * Возвращает функцию, результатом которой является promise, который никогда не переходит в состояние rejected.
 * При перехвате исключения результат будет содержать ошибку.
 * @param fn Оборачиваемая функция.
 * @param format Получив базовую информацию об ответе должна вернуть отформатированную информацию.
 * @return Функция.
 */
export function safetyAsync<T, P extends any[], F>(
  fn: (...args: P) => Promise<T>,
  format: SafetyFormatter<T, F>,
): (...args: P) => Promise<F>;

/**
 * Возвращает функцию, результатом которой является promise, который никогда не переходит в состояние rejected.
 * При перехвате исключения результат будет содержать ошибку.
 * @param fn Оборачиваемая функция.
 * @param format Получив базовую информацию об ответе должна вернуть отформатированную информацию.
 * @return Функция.
 */
export function safetyAsync<T, P extends any[], F>(
  fn: (...args: P) => Promise<T>,
  format: SafetyFormatter<T, F> = identity,
): (...args: P) => Promise<F> {
  return async function safetyWrapper(...args: P) {
    try {
      return format({ ok: true, result: await fn(...args) });
    } catch (error) {
      return format({ ok: false, error });
    }
  };
}
