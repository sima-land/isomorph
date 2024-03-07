import type { SeverityLevel } from '@sentry/browser';

/**
 * Возвращает уровень на основе статуса ответа.
 * @param status Статус HTTP-ответа.
 * @return Уровень.
 */
export function severityFromStatus(status: unknown): SeverityLevel {
  let result: SeverityLevel;

  if (typeof status === 'number') {
    switch (true) {
      case status >= 200 && status <= 299:
        result = 'info';
        break;
      case status >= 300 && status <= 499:
        result = 'warning';
        break;
      default:
        result = 'error';
    }
  } else {
    result = 'error';
  }

  return result;
}
