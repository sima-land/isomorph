import pipe from 'lodash/fp/pipe';
import isString from 'lodash/isString';
import split from 'lodash/fp/split';
import map from 'lodash/fp/map';
import compact from 'lodash/compact';
import get from 'lodash/get';
import trim from 'lodash/trim';

/**
 * Конвертирует строку со списком сегментов в массив.
 * @param {string} segments Строка со списком сегментов.
 * @return {Array} Массив со списком сегментов.
 */
const convertSegmentsToArray = pipe(
  value => isString(value) ? value : '',
  split(','),
  compact,
  map(trim)
);

/**
 * Возвращает функцию, определяющую включена ли заданная фича.
 * @param {string} feature Название фичи.
 * @return {function(string, string[]): boolean} Функция.
 */
export const checkFeatureBySegment = feature => (userSegment, allFeatures) => {
  const segments = convertSegmentsToArray(get(allFeatures, feature));

  return segments.includes('ALL') || segments.includes(userSegment);
};

export default checkFeatureBySegment;
