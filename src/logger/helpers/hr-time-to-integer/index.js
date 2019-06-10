const NS_PER_SEC = 1e9;

/**
 * Преобразует время высокого разрешения в число наносекунд
 * @param {Array} hrtime Массив с временем
 * @return {number} Время в наносекундах
 */
export const hrtimeToInteger = hrtime => hrtime
&& Array.isArray(hrtime)
&& hrtime.length === 2
  ? (hrtime[0] * NS_PER_SEC) + hrtime[1]
  : 0;
