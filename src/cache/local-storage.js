/**
 * Определяет доступен ли кэш.
 * @return {boolean} Флаг доступности кэш.
 */
export const isAvailable = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

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
 * Определяет, привышена ли квота.
 * @param {Object} error Информация об ошибке.
 * @return {boolean} Признак привышения квоты.
 */
export const isQuotaExceeded = error => {
  let quotaExceeded = false;
  if (error) {
    if (error.code) {
      switch (error.code) {
        case 22:
          quotaExceeded = true;
          break;
        case 1014:
          // Firefox
          if (error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            quotaExceeded = true;
          }
          break;
      }
    } else if (error.number === -2147024882) {
      // Internet Explorer 8
      quotaExceeded = true;
    }
  }
  return quotaExceeded;
};

/**
 * Набор методов для работы с кэшем.
 * @type {{set: Function, get: Function, status: boolean}}
 */
const localStorageCache = {
  get: getItem,
  set: setItem,
  status: isAvailable(),
  quotaExceeded: isQuotaExceeded,
};

export default localStorageCache;
