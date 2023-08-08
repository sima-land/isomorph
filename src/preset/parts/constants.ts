/**
 * События в процессе ответа на запрос.
 */
export const RESPONSE_EVENT_TYPE = {
  renderStart: Symbol('render:start'),
  renderFinish: Symbol('render:finish'),
} as const;
