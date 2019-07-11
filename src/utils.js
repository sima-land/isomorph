import isNumber from 'lodash/isNumber';
import EventEmitter from 'events';
import isFunction from 'lodash/isFunction';
import isString from 'lodash/isString';

/**
 * Возвращает количество миллисекунд по переданному результату вызова process.hrtime.
 * @param {Array<number>} hrtime Результат вызова process.hrtime.
 * @return {number} Количество миллисекунд.
 */
export const getMsFromHRT = hrtime => {
  let result = NaN;
  if (Array.isArray(hrtime) && hrtime.every(isNumber)) {
    result = Math.round((hrtime[0] * 1000) + (hrtime[1] / 1e6));
  }
  return result;
};

/**
 * Проверяет, является ли переданное значение числовым (может иметь строковый или числовой тип).
 * @param {*} value Проверяемое значение.
 * @return {boolean} Переданное значение является числовым?
 */
export const isNumeric = value => {
  const validTypes = ['string', 'number', 'bigint'];
  const hasValidType = validTypes.some(type => typeof value === type);
  return hasValidType && !isNaN(parseFloat(value)) && isFinite(Number(value));
};

/**
 * Оборачивает выполнение какой-либо функции в отправку событий начала и конца выполнения.
 * @param {Function} fn Функция, которую необходимо обернуть.
 * @param {string} startEvent Название события начала измерения.
 * @param {string} endEvent Название события конца измерения.
 * @param {EventEmitter} emitter Объект на котором будут отправляться события.
 * @return {Function} Функция обёрнутая в отправку событий.
 */
export const wrapInMeasureEvent = ({ fn, startEvent, endEvent, emitter }) => {
  if (!isFunction(fn)) {
    throw new TypeError('First argument property "fn" must be a function');
  }
  if (!isString(startEvent)) {
    throw new TypeError('First argument property "startEvent" must be a string');
  }
  if (!isString(endEvent)) {
    throw new TypeError('First argument property "endEvent" must be a string');
  }
  if (!(emitter instanceof EventEmitter)) {
    throw new TypeError('First argument property "emitter" must be an instance of EventEmitter');
  }
  return async (...args) => {
    emitter.emit(startEvent);
    const result = await fn(...args);
    emitter.emit(endEvent);
    return result;
  };
};
