import isString from 'lodash/isString';

/**
 * Функция создает IoC Container
 * @param {Array} services Массив сервисов, которые нужно зарегистрировать
 * @return {Object} IoC Container
 * @throws {TypeError} Выдаст ошибку если параметр "services" не массив
 */
const createContainer = function ({ services = [] } = {}) {
  if (!Array.isArray(services)) {
    throw new TypeError('Параметр "services" должен быть массивом');
  }

  const registry = {};

  /**
   * Создает объект зависимостей на основе их названий
   * @param {Object} service Сервис для которого нужно создать массив зависимостей
   * @return {Object} Объект зависимостей
   */
  const getDependencies = service => service.dependencies.reduce((result, dependency) => {
    result[dependency] = container.get(dependency);
    return result;
  }, {});

  const container = {
    /**
     * Добавляет зависимость в список зависимостей
     * @param {string} name Название зависимости
     * @param {Function} factory Функция-конструктор
     * @param {*} value Переданная зависимость
     * @param {Array} dependencies Массив зависимостей
     * @param {boolean} isSingleton Должна ли зависимость быть представлена только одним экземпляром
     * @throws {TypeError} Выдаст ошибку если параметр "name" не строка
     * @throws {Error} Выдаст ошибку если параметр "name" пустой
     * @throws {Error} Выдаст ошибку если не передан хотя бы один из параметров "factory", "singleton" или "value"
     */
    set ({ name, singleton, factory, value, dependencies = [] } = {}) {
      if (!isString(name)) {
        throw new TypeError('Параметр "name" должен быть сторокой');
      }

      if (name === '') {
        throw new Error('Параметр "name" не должен быть пустым');
      }

      if (factory === undefined && value === undefined && singleton === undefined) {
        throw Error(`Сервис зарегистрирован некорректно,
обязательно должен быть передан один из параметров "factory", "singleton" или "value"`);
      }

      registry[name] = {
        name,
        singleton,
        factory,
        dependencies,
        value,
      };
    },

    /**
     * Получает зависимость по ее названию
     * @param {string} name Название зависимости
     * @return {*} Зависимость
     * @throws {TypeError} Выдаст ошибку если параметр "name" не строка
     * @throws {Error} Выдаст ошибку если параметр "name" пустой
     * @throws {Error} Выдаст ошибку при попытке вызвать незарегистрированный сервис
     */
    get (name) {
      if (!isString(name)) {
        throw new TypeError('Параметр "name" должен быть сторокой');
      }

      if (name === '') {
        throw new Error('Параметр "name" не должен быть пустым');
      }

      const service = registry[name];
      let dependency;

      if (!service) {
        throw new Error(`Сервис "${name}" не зарегистрирован`);
      }

      if (service.value !== undefined) {
        dependency = service.value;
      }

      if (service.singleton) {
        if (!service.instance) {
          service.instance = service.singleton.call(null, getDependencies(service));
        }
        dependency = service.instance;
      }

      if (service.factory) {
        dependency = service.factory.call(null, getDependencies(service));
      }

      return dependency;
    },
  };

  services.forEach(service => container.set(service));
  return container;
};

export default createContainer;
