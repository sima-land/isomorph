/**
 * Определяет доступен ли кэш.
 * @return {boolean} Флаг доступности кэш.
 */
export const isAvailable = () => typeof window.localStorage !== 'undefined';

/**
 * Возвращает объект из кэша.
 * @param {string} key Ключ.
 * @return {*} Запрашиваемое значение из кэша.
 */
export const getItem = key => {
  const { value, expire } = JSON.parse(localStorage.getItem(key)) || {};
  const now = Date.now();
  const isExpired = expire
    ? now > expire
    : true;

  isExpired && localStorage.removeItem(key);

  return isExpired ? null : value;
};

/**
 * Добавляет значение в кэш.
 * @param {string} key Ключ.
 * @param {*} value Значение.
 * @param {number} [duration=3600] Время жизни значения в кэше в секундах.
 */
export const setItem = (key, value, duration = 3600) => {
  const now = Date.now();
  const durationMs = duration * 1000;
  const expire = now + durationMs;

  localStorage.setItem(key, JSON.stringify({
    value,
    expire,
  }));
};

/**
 * Набор методов для работы с кэшем.
 * @type {{set: Function, get: Function, status: boolean}}
 */
const localStorageCache = {
  get: getItem,
  set: setItem,
  status: isAvailable(),
};

export default localStorageCache;
