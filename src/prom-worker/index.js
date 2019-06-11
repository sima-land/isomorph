/**
 * Сервис сбора метрик
 * @param {Object} config Конфигурация приложения
 * @param {Object} metrics Объект метрик
 * @return {Object} Объект сервиса сбора материк
 */
export default function promWorker ({ config, metrics } = {}) {
  return {
    /**
     * Запускает таймер
     * @return {Array} Время начала
     */
    begin () {
      return process.hrtime();
    },

    /**
     * Считает время, обсервит, передает значения лейблов
     * @param {Array} startTime Время начала
     * @param {string} metricName Название метрики
     * @param {...*} labels Дополнительные параметры
     */
    end (startTime, metricName, ...labels) {
      const duration = process.hrtime(startTime);
      const ms = Math.round((duration[0] * 1000) + (duration[1] / 1e6));
      const metric = metrics[metricName];
      labels.length
        ? metric.labels(config.version, config.place, ...labels).observe(ms)
        : metric.labels(config.version, config.place).observe(ms);
    },

    /**
     * Инкремент счетчика
     * @param {string} metricName Название метрики
     * @param {...*} labels Дополнительные параметры
     */
    inc (metricName, ...labels) {
      const metric = metrics[metricName];
      metric.labels(config.version, config.place, ...labels).inc();
    },
  };
}
