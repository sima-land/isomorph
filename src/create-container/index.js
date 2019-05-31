import isString from 'lodash/isString';

/**
 * Функция создает IoC-контейнер
 * @param {Object} options Дополнительные опации для IoC-контейнера
 * @param {Array} options.services Массив сервисов, которые нужно зарегистрировать
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
     * @param {Object} options Опции необходимые для добавления зависимости
     * @param {string} options.name Название зависимости
     * @param {Function} options.factory Функция-конструктор
     * @param {*} options.value Переданная зависимость
     * @param {Array} options.dependencies Массив зависимостей
     * @throws {Error} Выдаст ошибку если параметр "name" не строка или пустая строка
     * @throws {Error} Выдаст ошибку если не передан ни один из параметров "factory", "singleton" или "value"
     */
    set ({ name, singleton, factory, value, dependencies = [] } = {}) {
      if (!isString(name) || name === '') {
        throw new Error('Параметр "name" должно быть непустой строкой');
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
          service.instance = new service.singleton(getDependencies(service));
        }
        dependency = service.instance;
      }

      if (service.factory) {
        dependency = new service.factory(getDependencies(service));
      }

      return dependency;
    },
  };

  services.forEach(service => container.set(service));
  return container;
};

export default createContainer;
