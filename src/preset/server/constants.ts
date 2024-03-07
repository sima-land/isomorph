/**
 * События в процессе ответа на запрос.
 */
export const PAGE_HANDLER_EVENT_TYPE = {
  // ВАЖНО: пусть здесь остаются строки в качестве значений чтобы их можно было использовать вместе с EventTarget
  renderStart: 'isomorph/render:start',
  renderFinish: 'isomorph/render:finish',
} as const;
