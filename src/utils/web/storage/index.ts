/* eslint-disable jsdoc/require-jsdoc */

/**
 * Интерфейс объекта-обертки для безопасной работы с WebStorage.
 */
export interface SafeStorage extends Storage {
  isAvailable: () => boolean;
}

/**
 * Возвращает объект для безопасной работы с браузерным хранилищем (LocalStorage, SessionStorage).
 * @param getStorage Функция, которая должна вернуть целевое хранилище.
 * @return Объект-обертка для безопасной работы с браузерным хранилищем.
 */
export function createSafeStorage(getStorage: () => Storage): SafeStorage {
  const isAvailable = (): boolean => {
    try {
      const testKey = `storage_test_key::${Date.now()}`;

      getStorage().setItem(testKey, testKey);
      getStorage().removeItem(testKey);

      return true;
    } catch {
      return false;
    }
  };

  const clear = (): void => {
    if (isAvailable()) {
      getStorage().clear();
    }
  };

  const getItem = (name: string): string | null => {
    if (isAvailable()) {
      return getStorage().getItem(name);
    }

    return null;
  };

  const key = (index: number): string | null => {
    if (isAvailable()) {
      return getStorage().key(index);
    }

    return null;
  };

  const removeItem = (name: string): void => {
    if (isAvailable()) {
      getStorage().removeItem(name);
    }
  };

  const setItem = (name: string, value: string): void => {
    if (isAvailable()) {
      getStorage().setItem(name, value);
    }
  };

  const getLength = (): number => {
    if (isAvailable()) {
      return getStorage().length;
    }

    return 0;
  };

  return {
    isAvailable,

    clear,
    getItem,
    key,
    removeItem,
    setItem,
    get length() {
      return getLength();
    },
  };
}
