/**
 * Проверяет, является ли переданное значение НЕ пустым массивом.
 * @param {*} data Проверяемое значение.
 * @return {boolean} Переданное значение является НЕ пустым массивом?
 */
export const isNotEmptyArray = data => Array.isArray(data) && data.length > 0;

export default isNotEmptyArray;
