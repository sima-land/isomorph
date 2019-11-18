import { createService } from '../container';

/**
 * Обертка методов кэша.
 * @param {Object} tracer Экземпляр jaeger-трейсера.
 * @param {Object} context Контекст спана.
 * @param {Object} cache  Кэш.
 * @return {Object} Объект с методами кэша.
 */
export const wrapInTrace = (tracer, context, cache) => ({
  /**
   * Получение ключа из кэша.
   * @param {string} key Ключ.
   * @return {Promise} Промис для получения ответа.
   */
  get: async key => {
    const span = tracer.startSpan(`Redis GET ${key}`, {
      childOf: context,
    });
    const result = await cache.get(key);
    span.finish();
    return result;
  },

  /**
   * Задаем значение в кэш.
   * @param {string} key Ключ.
   * @param {string} value Новое значение.
   * @param {number} duration Длительность.
   */
  set: (key, value, duration = 3600) => {
    const span = tracer.startSpan(`Redis SET ${key}`, {
      childOf: context,
    });
    cache.set(key, value, duration);
    span.finish();
  },

  /**
   * Геттер статуса кэша.
   */
  get status () {
    return cache.status;
  },
});

/**
 * Преобразует опции сервиса в аргументы функции.
 * @param {Object} tracer Экземпляр jaeger-трейсера.
 * @param {Object} context Контекст спана.
 * @param {Object} cache  Кэш.
 * @return {Object} Config Объект с параметрами Redis.
 */
export const mapServiceOptionsToArgs = ({ tracer, context = {}, cache }) => [tracer, context, cache];
export default createService(wrapInTrace, mapServiceOptionsToArgs);
