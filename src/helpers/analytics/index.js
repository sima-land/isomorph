import { useRef } from 'react';
import { call } from 'redux-saga/effects';
import { shallowEqual } from 'react-redux';
import isFunction from 'lodash/isFunction';

/**
 * Отправка аналитики в око.
 * @param {Object} eventData Данные события для отправки.
 */
export const okoPush = eventData => {
  isFunction(window.oko?.push) && window.oko.push(eventData);
};

/**
 * Эффект для отправки события в ОКО.
 * @param {Object} data Данные события для отправки в ОКО.
 */
export function * sendAnalytics (data) {
  yield call(okoPush, data);
}

/**
 * Хук, возвращающий функцию, которая отправит аналитику в ОКО.
 * @param {Object} data Данные события для отправки в ОКО.
 * @return {Function} Функция.
 */
export const useAnalytics = data => {
  const dataRef = useRef();
  const fnRef = useRef();

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
