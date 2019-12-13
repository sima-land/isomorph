import isArray from 'lodash/isArray';
import isString from 'lodash/isString';

/**
 * Проверяет, соответствует ли переданная строка одному из паттернов в переданном масиве.
 * @param {string} str Строка для проверки.
 * @param {string[]} patternList Массив строк.
 * @return {boolean} Соответствует или нет.
 */
const isMatchPatternList = (str, patternList) =>
  isString(str) && isArray(patternList) && patternList.some(pattern => RegExp(pattern).test(str));

export default isMatchPatternList;
