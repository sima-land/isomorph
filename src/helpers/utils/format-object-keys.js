import isPlainObject from 'lodash/isPlainObject';
import camelCase from 'lodash/camelCase';

/**
 * Переводит ключи объекта в camelCase.
 * @param {Object} object Объект ключи которого нужно отформатировать.
 * @return {Object} Отформатированный объект.
 */
export default function formatObjectKeys (object) {
  if (!isPlainObject(object)) {
    throw new TypeError('Параметр "object" должен быть чистым объектом');
  }

  return Object.entries(object).reduce((formattedObject, current) => {
    const [key, value] = current;
    const formattedKey = camelCase(key);

    if (formattedKey) {
      formattedObject[formattedKey] = value;
    }
    return formattedObject;
  }, {});
}
