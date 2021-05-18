import { useRef } from 'react';
import { call } from 'redux-saga/effects';
import { shallowEqual } from 'react-redux';
import { get, isFunction } from 'lodash';

export type OkoEvent = Record<string, any>;

/**
 * Отправка аналитики в око.
 * @param eventData Данные события для отправки.
 */
export const okoPush = (eventData: OkoEvent) => {
  // копируем объект так как window.oko.push меняет свой аргумент в процессе выполнения
  isFunction((window as any).oko?.push) && (window as any).oko.push({ ...eventData });
};

/**
 * Эффект для отправки события в ОКО.
 * @param data Данные события для отправки в ОКО.
 */
export function * sendAnalytics (data: OkoEvent) {
  yield call(okoPush, data);
}

/**
 * Хук, возвращающий функцию, которая отправит аналитику в ОКО.
 * @param data Данные события для отправки в ОКО.
 * @return Функция.
 */
export const useAnalytics = (data: OkoEvent) => {
  const dataRef = useRef<OkoEvent>();
  const fnRef = useRef<() => void>();

  if (!dataRef.current) {
    dataRef.current = { ...data };
  }

  if (!fnRef.current) {
    fnRef.current = () => okoPush(dataRef.current);
  }

  if (!shallowEqual(data, dataRef.current)) {
    throw Error([
      'useAnalytics: Данные для аналитики изменились.',
      'Если необходимо использовать динамические данные, вынесите логику из React-компонента.',
    ].join('\n'));
  }

  return fnRef.current;
};
