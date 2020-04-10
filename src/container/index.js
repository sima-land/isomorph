import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import ServiceNotFoundError from './service-not-found-error';
import getDependencies from './get-dependencies';
import isContainer from './is-container';

/**
 * Оборачивает функцию для использования в контейнере.
 * @param {Function} fn Функция, которую необходимо обернуть.
 * @param {Function} dependenciesToArgs Функция для преобразования зависимостей сервиса в аргументы функции.
 * @return {Function} Функция-сервис, для использования в контейнере.
 */
export const createService = (
  fn,
  dependenciesToArgs
) => (dependencies, ...args) => fn(...dependenciesToArgs(dependencies), ...args);

/**
 * Создаёт функцию для получения синглтона контейнера с заданными параметрами.
 * @param {Object} options Опции для создания контейнера.
 * @return {function(): Object} Функция для получения контейнера-синглтона.
 */
export const createSingleton = options => {
  let container;
  return () => {
    if (!container) {
      container = create(options);
    }
    return container;
  };
};

/**
 * Создаёт функцию-фабрику для создания нового экземпляра контейнера при её вызове.
 * @param {Object} options Опции для создания контейнера.
 * @return {function(): Object} Функция-фабрика для получения экземпляра контейнера с заданными параметрами.
 */
export const createFactory = options => () => create(options);

/**
 * Реализует наследование контейнера от другого контейнера.
 * @param {Object} container Дочерний контейнер.
 * @param {Object} parentContainer Родительский контейнер.
 * @return {Object} Контейнер с поиском зависимости в родителе.
 */
const inherit = (
  container,
  parentContainer,
) => {
  let result = container;
  if (isContainer(parentContainer)) {
    result = {
      ...container,

      /**
       * Оборачивает получение зависимости для добавления поиска в родительском контейнере.
       * @param {string} name Название зависимости.
       * @return {*} Зависимость.
       * @throws {TypeError} Выдаст ошибку если параметр "name" не строка
       * @throws {Error} Выдаст ошибку если параметр "name" не строка или пустая строка
       * @throws {ServiceNotFoundError} Выдаст ошибку при попытке вызвать незарегистрированный сервис
       */
      async get (name) {
        let dependency;
        try {
          dependency = await container.get(name);
        } catch (e) {
          if (e instanceof ServiceNotFoundError) {
            dependency = await parentContainer.get(name);
          } else {
            throw e;
          }
        }
        return dependency;
      },
    };
  }
  return result;
};

/**
 * Функция создает IoC-контейнер.
 * @param {Object} options Дополнительные опции для IoC-контейнера.
 * @param {Array} options.services Массив сервисов, которые нужно зарегистрировать.
 * @param {Object} options.parent Родительский контейнер.
 * @return {Object} IoC Container.
 * @throws {TypeError} Выдаст ошибку если параметр "services" не массив
 */
export default function create ({ services = [], parent = null } = {}) {
  if (!Array.isArray(services)) {
    throw new TypeError('Параметр "services" должен быть массивом');
  }

  const registry = {};

  const container = inherit({
    /**
     * Добавляет зависимость в список зависимостей.
     * @param {Object} options Опции необходимые для добавления зависимости.
     * @param {string} options.name Название зависимости.
     * @param {Function} options.singleton Функция-синглтон.
     * @param {Function} options.factory Функция-конструктор.
     * @param {*} options.value Переданная зависимость.
     * @param {Array} options.dependencies Массив зависимостей.
     * @throws {Error} Выдаст ошибку если параметр "name" не строка или пустая строка
     * @throws {Error} Выдаст ошибку если не передан ни один из параметров "factory", "singleton" или "value"
     */
    set ({ name, singleton, factory, value, dependencies = [] } = {}) {
      if (!isString(name) || name === '') {
        throw new Error('Параметр "name" должен быть непустой строкой');
      }

      if (factory !== undefined && !isFunction(factory)) {
        throw new TypeError('Параметр "factory" должен быть функцией');
      }

      if (singleton !== undefined && !isFunction(singleton)) {
        throw new TypeError('Параметр "singleton" должен быть функцией');
      }

      if (factory === undefined && value === undefined && singleton === undefined) {
        throw Error(`Сервис ${name} не зарегистрирован,
так как обязательно должен быть передан один из параметров "factory", "singleton" или "value"`);
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
     * Получает зависимость по ее названию.
     * @param {string} name Название зависимости.
     * @return {*} Зависимость.
     * @throws {TypeError} Выдаст ошибку если параметр "name" не строка
     * @throws {Error} Выдаст ошибку если параметр "name" не строка или пустая строка
     * @throws {ServiceNotFoundError} Выдаст ошибку при попытке вызвать незарегистрированный сервис
     */
    async get (name) {
      if (!isString(name) || name === '') {
        throw new Error('Параметр "name" должен быть непустой строкой');
      }

      const service = registry[name];
      let dependency;

      if (!service) {
        throw new ServiceNotFoundError(`Сервис "${name}" не зарегистрирован`);
      }

      if (service.singleton && !service.value) {
        service.value = await service.singleton(
          {
            ...await getDependencies(container, service.dependencies),
          },
        );
      }

      if (service.value !== undefined) {
        dependency = service.value;
      }

      if (service.factory) {
        dependency = await service.factory(
          {
            ...await getDependencies(container, service.dependencies),
          }
        );
      }

      return dependency;
    },
  }, parent);

  services.forEach(service => container.set(service));

  return container;
}
