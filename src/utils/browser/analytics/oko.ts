import { useRef } from 'react';
import { isEqual, isFunction } from 'lodash';

export type OkoEvent = Record<string, any>;

/**
 * Получив объект события, запустит его отправку в ОКО (если на странице есть ОКО).
 * @param eventData Данные события для отправки.
 */
export const okoPush = (eventData: OkoEvent) => {
  const win: any = window;

  // копируем объект так как window.oko.push меняет свой аргумент в процессе выполнения
  isFunction(win.oko?.push) && win.oko.push({ ...eventData });
};

/**
 * Хук, возвращающий функцию, которая отправит аналитику в ОКО.
 * Не позволяет менять данные для отправки.
 * @param data Данные события для отправки в ОКО.
 * @return Функция.
 */
export const useOkoPush = (data: OkoEvent) => {
  const dataRef = useRef<OkoEvent>();
  const fnRef = useRef<() => void>();

  if (!dataRef.current) {
    dataRef.current = { ...data };
  }

  if (!fnRef.current) {
    fnRef.current = () => okoPush(dataRef.current as OkoEvent);
  }

  if (!isEqual(data, dataRef.current)) {
    throw Error(
      [
        'useAnalytics: Данные для аналитики изменились.',
        'Если необходимо использовать динамические данные, вынесите логику из React-компонента.',
      ].join('\n'),
    );
  }

  return fnRef.current;
};
