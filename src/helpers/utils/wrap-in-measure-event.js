import EventEmitter from 'events';
import isFunction from 'lodash.isfunction';
import isString from 'lodash.isstring';

/**
 * Оборачивает выполнение какой-либо функции в отправку событий начала и конца выполнения.
 * @param {Object} param Параметры.
 * @param {Function} param.fn Функция, которую необходимо обернуть.
 * @param {string} param.startEvent Название события начала измерения.
 * @param {string} param.endEvent Название события конца измерения.
 * @param {EventEmitter} param.emitter Объект на котором будут отправляться события.
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

export default wrapInMeasureEvent;
