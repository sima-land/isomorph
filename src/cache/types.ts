/**
 * Простейший интерфейс кэша.
 */
export interface Cache {
  /**
   * Возвращает значение из кэша по ключу.
   * @param key Ключ.
   * @return Значение.
   */
  get: (key: string) => unknown;

  /**
   * Записывает значение в кэш по ключу.
   * @param key Ключ.
   */
  set: (key: string, value: any) => void;

  /**
   * Удаляет значение из кэша по ключу.
   * @param key Ключ.
   */
  delete: (key: string) => void;

  /**
   * Полностью очищает кэш.
   */
  clear: () => void;

  /**
   * Возвращает `true` в случае, если значение под переданным ключем присутствует в кэше, `false` в противном случае.
   */
  has: (key: string) => boolean;
}
