import { isFunction } from 'lodash';

/**
 * Отправка аналитики в око.
 * @param eventData Данные события для отправки.
 */
export const dataLayerPush = (eventData: Record<string, any>) => {
  const win: any = window;

  // копируем объект так как window.dataLayer.push может менять аргумент в процессе работы
  isFunction(win.dataLayer?.push) && win.dataLayer.push({ ...eventData });
};
