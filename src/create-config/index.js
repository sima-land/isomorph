import isPlainObject from 'lodash/isPlainObject';
import formatObjectKeys from '../format-object-keys/';

/**
 * Собирает объект конфигурации из переданных параметров
 * @param {Object} data Объект с данными, которые нужно добавить в конфигурацию
 * @param {Object} base Базовый объект на основе которого строится конфигурация
 * @return {Object} Объект конфигурации
 */
export default function createConfig (data = {}, base = { ...process.env }) {
  if (!isPlainObject(data)) {
    throw new TypeError('Параметр "data" должен быть чистым объектом');
  }

  if (!isPlainObject(base)) {
    throw new TypeError('Параметр "base" должен быть чистым объектом');
  }

  return Object.entries(data).reduce((config, current) => {
    const [key, value] = current;

    if (!(key in config)) {
      config[key] = value;
    }
    return config;
  }, formatObjectKeys({ ...base }));
}
