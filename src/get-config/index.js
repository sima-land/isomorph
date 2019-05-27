import isPlainObject from 'lodash/isPlainObject';
import formatObjectKeys from '../format-object-keys/';

/**
 * Возвращает конфиг из переданных параметров
 * @param {Object} data Объект с данными, которые нужно добавить в конфиг
 * @param {Object} base Базовый объект на основе которого строится конфиг
 * @return {Object} Объект конфига
 */
export default function getConfig (data = {}, base = { ...process.env }) {
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
