/**
 * Константы лейблов для метрик по соглашению.
 * @todo Убрать в пресеты.
 */
export const ConventionalLabels = {
  HTTP_RESPONSE: ['version', 'route', 'code', 'method'],
  SSR: ['version', 'route', 'method'],
} as const;
