import isNumber from 'lodash/isNumber';

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
