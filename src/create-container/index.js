import isArray from 'lodash/isArray';
import isString from 'lodash/isString';

/**
 * Функция создает IoC Container
 * @param {Array} services Массив сервисов, которые нужно зарегистрировать
 * @return {Object} IoC Container
 */
const createContainer = function ({ services = [] } = {}) {
  if (!isArray(services)) {
    throw new TypeError('Параметр "services" должен быть массивом');
  }

  const registry = {};

  /**
   * Создает массив зависимостей на основе их названий
   * @param {Object} service Сервис для которого нужно создать массив зависимостей
   * @return {Array} Массив зависимостей
   */
  const getDependencies = service => service.dependencies.map(dependency => container.get(dependency));

  const container = {
    /**
     * Добавляет зависимость в список зависимостей
     * @param {string} name Название зависимости
     * @param {Function} factory Функция-конструктор
     * @param {*} value Переданная зависимость
     * @param {Array} dependencies Массив зависимостей
     * @param {boolean} isSingleton Должна ли зависимость быть представлена только одним экземпляром
     */
    set ({ name, factory, value, dependencies = [], isSingleton = false } = {}) {
      if (!isString(name)) {
        throw new TypeError('Параметр "name" должен быть сторокой');
      }

      if (name === '') {
        throw new Error('Параметр "name" не должен быть пустым');
      }

      registry[name] = {
        name,
        factory,
        dependencies,
        value,
        isSingleton,
      };
    },

    /**
     * Получает зависимость по ее названию
     * @param {string} name Название зависимости
     * @return {*} Возвращаемая зависимость
     */
    get (name) {
      if (!isString(name)) {
        throw new TypeError('Параметр "name" должен быть сторокой');
      }

      if (name === '') {
        throw new Error('Параметр "name" не должен быть пустым');
      }

      const service = registry[name];

      if (!service) {
        throw new Error(`Сервис "${name}" не зарегистрирован`);
      }

      if (service.value !== undefined) {
        return service.value;
      }

      if (service.isSingleton && !service.instance) {
        service.instance = service.factory.apply(null, getDependencies(service));
      }

      if (service.instance) {
        return service.instance;
      }

      if (service.factory) {
        return service.factory.apply(null, getDependencies(service));
      }

      throw Error('Сервис зарегристрован некорректно, в местод "set" нужно передать "factory" или "value"');
    },
  };

  services.forEach(service => container.set(service));
  return container;
};

export default createContainer;
