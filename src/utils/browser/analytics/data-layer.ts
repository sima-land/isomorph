/**
 * Отправка аналитики в dataLayer.
 * @param eventData Данные события для отправки.
 */
export function dataLayerPush(eventData: Record<string, any>): void {
  const win: any = window;

  // копируем объект так как window.dataLayer.push может менять аргумент в процессе работы
  typeof win.dataLayer?.push === 'function' && win.dataLayer.push({ ...eventData });
}
