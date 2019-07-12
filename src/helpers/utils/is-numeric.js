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

export default isNumeric;
