/* eslint-disable require-jsdoc, jsdoc/require-jsdoc */

/**
 * Интерфейс объекта-обертки для безопасной работы с WebStorage.
 */
export interface StorageUtils
  extends Pick<Storage, 'clear' | 'getItem' | 'key' | 'removeItem' | 'setItem' | 'length'> {
  isAvailable: () => boolean;
}

/**
 * Возвращает объект для безопасной работы с браузерным хранилищем (LocalStorage, SessionStorage).
 * @param getStorage Функция, которая должна вернуть целевое хранилище.
 * @return Объект-обертка для безопасной работы с браузерным хранилищем.
 */
export function createStorageUtils(getStorage: () => Storage): StorageUtils {
  function isAvailable(): boolean {
    try {
      const testKey = `local_storage_test_key::${Date.now()}`;

      getStorage().setItem(testKey, testKey);
      getStorage().removeItem(testKey);

      return true;
    } catch {
      return false;
    }
  }

  function clear(): void {
    if (isAvailable()) {
      getStorage().clear();
    }
  }

  function getItem(name: string): string | null {
    if (isAvailable()) {
      return getStorage().getItem(name);
    }

    return null;
  }

  function key(index: number): string | null {
    if (isAvailable()) {
      return getStorage().key(index);
    }
    return null;
  }

  function removeItem(name: string): void {
    if (isAvailable()) {
      getStorage().removeItem(name);
    }
  }

  function setItem(name: string, value: string): void {
    if (isAvailable()) {
      getStorage().setItem(name, value);
    }
  }

  function length(): number {
    if (isAvailable()) {
      return getStorage().length;
    }

    return 0;
  }

  return {
    isAvailable,

    clear,
    getItem,
    key,
    removeItem,
    setItem,
    get length() {
      return length();
    },
  };
}
