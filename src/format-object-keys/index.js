import { camelCase, toPairs, isPlainObject } from 'lodash';

/**
 * Переводит ключи объекта в camelCase
 * @param {Object} obj Объект ключи которого нужно отформатировать
 * @return {Object} Отформатированный объект
 */
export default function formatObjectKeys (obj) {
  if (!isPlainObject(obj)) {
    throw new TypeError('Параметр "obj" должен быть объеком');
  }

  return toPairs(obj).reduce((formattedObject, current) => {
    const formattedKey = camelCase(current[0]);

    if (formattedKey) {
      formattedObject[formattedKey] = current[1];
    }
    return formattedObject;
  }, {});
}
