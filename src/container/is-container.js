import isPlainObject from 'lodash/isPlainObject';
import isFunction from 'lodash/isFunction';

/**
 * Проверяет является ли переданный экземпляр контейнером.
 * @param {*} instance Предполагаемый экземпляр контейнера.
 * @return {boolean} Является ли переданный экземпляр контейнером.
 */
const isContainer = instance =>
  isPlainObject(instance)
  && isFunction(instance.get)
  && isFunction(instance.set);

export default isContainer;
