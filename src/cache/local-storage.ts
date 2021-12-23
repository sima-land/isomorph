/**
 * Определяет доступен ли кэш.
 * @return Флаг доступности кэш.
 */
export const isAvailable = (): boolean => {
  try {
    const testKey = `local_storage_test_key::${Date.now()}`;

    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);

    return true;
  } catch {
    return false;
  }
}

/**
 * Возвращает объект.
 * @param key Ключ.
 * @return Запрашиваемое значение.
 */
export const getItem = (key: string): unknown => {
  const { value, expire } = JSON.parse(localStorage.getItem(key) || '{}');
  const now = Date.now();
  const isExpired = expire
    ? now > expire
    : true;

  isExpired && localStorage.removeItem(key);

  return isExpired ? null : value;
};

/**
 * Добавляет значение.
 * @param key Ключ.
 * @param value Значение.
 * @param duration Время жизни значения в секундах.
 */
export const setItem = (key: string, value: any, duration = 3600) => {
  const now = Date.now();
  const durationMs = duration * 1000;
  const expire = now + durationMs;

  localStorage.setItem(key, JSON.stringify({
    value,
    expire,
  }));
};

/**
 * Определяет, превышена ли квота.
 * @param error Информация об ошибке.
 * @return Признак превышения квоты.
 */
export const isQuotaExceeded = (error: any): boolean => {
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
      // IE 8
      quotaExceeded = true;
    }
  }

  return quotaExceeded;
};

/**
 * Набор методов для работы с кэшем.
 */
const LocalStorageCache = {
  get: getItem,
  set: setItem,
  status: isAvailable(),
  quotaExceeded: isQuotaExceeded,
} as const;

export default LocalStorageCache;
