import { camelCase, isPlainObject } from 'lodash';

/**
 * Переводит ключи объекта в camelCase
 * @param {Object} obj Объект ключи которого нужно отформатировать
 * @return {Object} Отформатированный объект
 */
export default function formatObjectKeys (obj) {
  if (!isPlainObject(obj)) {
    throw new TypeError('Параметр "obj" должен быть объеком');
  }

  return Object.entries(obj).reduce((formattedObject, current) => {
    const [key, value] = current;
    const formattedKey = camelCase(key);

    if (formattedKey) {
      formattedObject[formattedKey] = value;
    }
    return formattedObject;
  }, {});
}
