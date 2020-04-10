import isNumber from 'lodash/isNumber';

/**
 * Возвращает количество миллисекунд по переданному результату вызова process.hrtime.
 * @param {Array<number>} hrtime Результат вызова process.hrtime.
 * @return {number} Количество миллисекунд.
 */
export const getMsFromHRT = hrtime => {
  let result = NaN;
  if (Array.isArray(hrtime) && hrtime.every(isNumber)) {
    result = (hrtime[0] * 1000) + (hrtime[1] / 1e6);
  }
  return result;
};

export default getMsFromHRT;
