import isString from 'lodash.isstring';
import isFunction from 'lodash.isfunction';
import isPlainObject from 'lodash.isplainobject';

/**
 * Создает объект зависимостей на основе их названий.
 * @param {Object} container Экземпляр контейнера в котором должен осуществляться поиск зависимостей.
 * @param {Object} dependencies Список зависимостей.
 * @param {Object} options Дополнительные опции для инициализации зависимостей.
 * @return {Object} Объект зависимостей.
 */
export const getDependencies = (
  container,
  dependencies = [],
  options = {},
) => dependencies.reduce(async (prevPromise, dependency) => {
  const result = await prevPromise;
  if (isString(dependency)) {
    result[dependency] = await container.get(dependency, options);
  }

  if (isPlainObject(dependency)) {
    if (isStaticDependency(dependency)) {
      result[dependency.name] = dependency.value;
    } else {
      const [necessaryName, necessaryDepName] = Object.entries(dependency).shift() || [];
      if (necessaryName && necessaryDepName) {
        result[necessaryName] = await container.get(necessaryDepName, options);
      }
    }
  }

  return result;
}, Promise.resolve({}));

/**
 * Определяет, является ли зависимость статической, то есть не требующей инициализации.
 * @param {Object} dependency Конфигурация зависимости.
 * @param {string} dependency.name Название зависимости.
 * @param {*} dependency.value Значение зависимости.
 * @return {boolean} Является ли зависимость статической.
 */
export const isStaticDependency = ({ name, value }) => typeof name === 'string' && typeof value !== 'undefined';

/**
 * Оборачивает функцию в функцию для получения части зависимостей из контейнера.
 * @param {Object} options Опции для конфигурирования контекста.
 * @param {Object} options.container Контейнер в котором будет осуществляться поиск зависимостей.
 * @param {Function} options.fn Функция, в которую будут переданы зависимости.
 * @param {Array} options.dependencies Список зависимостей, которые необходимо добавить.
 * @param {Function} options.argsToOptions Функция для преобразования аргументов вызываемой функции
 * в опции для инициализации зависимостей данной функции.
 * @return {Function} Частично применённая функция для использования,
 * в которую прокинуто получение зависимостей при вызове.
 */
export const wrapInContext = (
  {
    container,
    fn,
    dependencies = [],
    argsToOptions,
  }
) => async (...args) => fn(
  ...args,
  ...Object.values(
    await getDependencies(
      container,
      dependencies,
      isFunction(argsToOptions) ? argsToOptions(...args) : {}
    )
  )
);

/**
 * Оборачивает функцию для использования в контейнере.
 * @param {Function} fn Функция, которую необходимо обернуть.
 * @param {Function} optionsToArgs Функция для преобразования опций сервиса в аргументы функции.
 * @return {Function} Функция-сервис, для использования в контейнере.
 */
export const createService = (
  fn,
  optionsToArgs
) => (dependencies, ...args) => fn(...optionsToArgs(dependencies), ...args);

/**
 * Функция создает IoC-контейнер.
 * @param {Object} options Дополнительные опации для IoC-контейнера.
 * @param {Array} options.services Массив сервисов, которые нужно зарегистрировать.
 * @return {Object} IoC Container.
 * @throws {TypeError} Выдаст ошибку если параметр "services" не массив
 */
export default function create ({ services = [] } = {}) {
  if (!Array.isArray(services)) {
    throw new TypeError('Параметр "services" должен быть массивом');
  }

  const registry = {};

  const container = {
    /**
     * Добавляет зависимость в список зависимостей.
     * @param {Object} options Опции необходимые для добавления зависимости.
     * @param {string} options.name Название зависимости.
     * @param {Function} options.singleton Функция-синглотон.
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
     * Получает зависимость по ее названию.
     * @param {string} name Название зависимости.
     * @param {Object} options Дополнительные или переопределяющие зависимости,
     * которые необходимо передать сервису и его зависимостям при инициализации.
     * @return {*} Зависимость.
     * @throws {TypeError} Выдаст ошибку если параметр "name" не строка
     * @throws {Error} Выдаст ошибку если параметр "name" не строка или пустая строка
     * @throws {Error} Выдаст ошибку при попытке вызвать незарегистрированный сервис
     */
    async get (name, options = {}) {
      if (!isString(name) || name === '') {
        throw new Error('Параметр "name" должен быть непустой строкой');
      }

      const service = registry[name];
      let dependency;

      if (!service) {
        throw new Error(`Сервис "${name}" не зарегистрирован`);
      }

      if (service.singleton && !service.value) {
        service.value = await service.singleton(
          {
            ...await getDependencies(container, service.dependencies, options),
            ...options,
          },
        );
      }

      if (service.value !== undefined) {
        dependency = service.value;
      }

      if (service.factory) {
        dependency = await service.factory(
          {
            ...await getDependencies(container, service.dependencies, options),
            ...options,
          }
        );
      }

      return dependency;
    },
  };

  services.forEach(service => container.set(service));

  return container;
}
