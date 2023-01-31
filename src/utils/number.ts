/**
 * Переводит наносекунды в миллисекунды.
 * @param nanoseconds Наносекунды.
 * @return Миллисекунды.
 */
export function toMilliseconds(nanoseconds: bigint): number {
  return Number(nanoseconds / 1000000n);
}
