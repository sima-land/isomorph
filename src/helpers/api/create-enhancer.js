import { createService } from '../../container';

/**
 * Конструктор для создания функции для применения middleware к экземпляру axios.
 * @param {Array} middlewares Middleware, которые должны быть применены.
 * @return {function(Object): Object} Функция для применения middleware к экземпляру axios.
 */
export const applyMiddleware = (...middlewares) =>
  instance =>
    middlewares.reduce(
      (instance, middleware) => instance.use(middleware),
      instance
    );

/**
 * Функция для сборки middleware в функцию для применения к экземпляру axios.
 * @param {Array<Function>} constructors Функции-конструкторы middleware.
 * @param {Object} params Параметры для конструкторов.
 * @return {function(Object): Object} Функция для применения созданных middleware к экземпляру axios.
 */
export const createEnhancer = (constructors, params) =>
  applyMiddleware(
    ...Array.isArray(constructors) ? constructors.map(constructor => constructor(params)) : []
  );

/**
 * Преобразует опции сервиса в аргументы функции.
 * @param {Object} param Параметры.
 * @param {Array<Function>} param.constructors Функции-конструкторы middleware.
 * @param {Object} param.params Параметры для конструкторов.
 * @return {Array} Массив агрументов для использования в функции.
 */
export const mapServiceOptionsToArgs = (
  {
    constructors,
    ...params
  }
) => [
  constructors,
  params,
];

/**
 * Функция для сборки middleware в функцию для применения к экземпляру axios для использования в контейнере.
 * @type {Function}
 */
const enhancerConstructor = createService(
  createEnhancer,
  mapServiceOptionsToArgs
);

export default enhancerConstructor;
