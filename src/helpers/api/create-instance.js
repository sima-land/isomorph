import { create } from 'axios';
import { wrapInstance } from 'middleware-axios';
import isFunction from 'lodash/isFunction';
import { createService } from '../../container';

/**
 * Функция для создания экземпляра axios с возможностью передать обработчик для применения middleware.
 * @param {Object} config Конфигурация для axios.
 * @param {Function} enhancer Функция для применения middleware к экземпляру.
 * @return {Object} Экземпляр axios с применёнными middleware.
 */
export const createInstance = (config, enhancer) => {
  const instance = wrapInstance(create(config));
  return isFunction(enhancer) ? enhancer(instance) : instance;
};

/**
 * Преобразует опции сервиса в аргументы функции.
 * @param {Object} param Параметры.
 * @param {Object} param.config Конфигурация для axios.
 * @param {Function} param.enhancer Функция для применения middleware к экземпляру.
 * @return {Array} Массив агрументов для использования в функции.
 */
export const mapServiceOptionsToArgs = (
  {
    config,
    enhancer,
  }
) => [
  config,
  enhancer,
];

/**
 * Конструктор экземпляра axios для использования в контейнере.
 * @type {Function}
 */
const instanceConstructor = createService(
  createInstance,
  mapServiceOptionsToArgs
);

export default instanceConstructor;
