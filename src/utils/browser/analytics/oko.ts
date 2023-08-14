export type OkoEvent = Record<string, any>;

/**
 * Получив объект события, запустит его отправку в ОКО (если на странице есть ОКО).
 * @param eventData Данные события для отправки.
 */
export function okoPush(eventData: OkoEvent): void {
  const target: any = window;

  if (typeof target.oko?.push === 'function') {
    // копируем объект так как window.oko.push меняет свой аргумент в процессе выполнения
    target.oko.push({ ...eventData });
  }
}
