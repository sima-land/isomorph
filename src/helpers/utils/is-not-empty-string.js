/**
 * Проверяет, является ли переданное значение НЕ пустой строкой (или строкой содержащей только пробельные символы).
 * @param {*} value Проверяемое значение.
 * @param {*} trim Обрезка пробельных символов.
 * Если передано false - к строке не будет применена функция trim() перед проверкой на длину.
 * @return {boolean} Переданное значение является НЕ пустой строкой?
 */
export const isNotEmptyString = (value, trim = true) => typeof value === 'string'
  && (trim ? value.trim().length > 0 : value.length > 0);

export default isNotEmptyString;
