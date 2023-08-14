/**
 * Отправка аналитики в dataLayer.
 * @param eventData Данные события для отправки.
 */
export function dataLayerPush(eventData: Record<string, any>): void {
  const target: any = window;

  if (typeof target.dataLayer?.push === 'function') {
    // копируем объект так как window.dataLayer.push может менять аргумент в процессе работы
    target.dataLayer.push({ ...eventData });
  }
}
