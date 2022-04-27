/**
 * Возвращает значение process.env.NODE_ENV или "unknown".
 * @return Значение.
 */
export function defineEnvironment(): string {
  return process.env.NODE_ENV || 'unknown';
}
