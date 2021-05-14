import isString from 'lodash/isString';
import isPlainObject from 'lodash/isPlainObject';

/**
 * Определяет, является ли зависимость статической, то есть не требующей инициализации.
 * @param {Object} dependency Конфигурация зависимости.
 * @param {string} dependency.name Название зависимости.
 * @param {*} dependency.value Значение зависимости.
 * @return {boolean} Является ли зависимость статической.
 */
export const isStaticDependency = ({ name, value }) =>
  typeof name === 'string'
  && typeof value !== 'undefined';

/**
 * Создает объект зависимостей на основе их названий.
 * @param {Object} container Экземпляр контейнера в котором должен осуществляться поиск зависимостей.
 * @param {Object} dependencies Список зависимостей.
 * @param {string} serviceName Названия сервиса.
 * @return {Object} Объект зависимостей.
 */
const getDependencies = (
  container,
  dependencies = [],
  serviceName
) => dependencies.reduce(async (prevPromise, dependency) => {
  const result = await prevPromise;
  if (isString(dependency)) {
    result[dependency] = await container.get(dependency, serviceName);
  }

  if (isPlainObject(dependency)) {
    if (isStaticDependency(dependency)) {
      result[dependency.name] = dependency.value;
    } else {
      const [necessaryName, necessaryDepName] = Object.entries(dependency).shift() || [];
      if (necessaryName && necessaryDepName) {
        result[necessaryName] = await container.get(necessaryDepName);
      }
    }
  }

  return result;
}, Promise.resolve({}));

export default getDependencies;
