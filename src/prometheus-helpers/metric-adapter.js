import PrometheusClient from 'prom-client';

/**
 * Список имен конструкторов из пакета "prom-client", пригодных для создания адаптеров.
 * @type {Array<string>}
 */
export const availableMetricTypes = Object.freeze([
  'Counter',
  'Gauge',
  'Histogram',
  'Summary',
]);

/**
 * Ключ свойства адаптера с оригинальным объектом метрики.
 * @type {symbol}
 */
export const originalMetricKey = Symbol('original-metric-key');

/**
 * Возвращает оригинальный объект метрики из переданного адаптера.
 * @param {PrometheusMetric} adapter Объект адаптера.
 * @return {Object} Объект метрики.
 */
export const getOriginalInstance = adapter => adapter
  ? adapter[originalMetricKey]
  : undefined;

/**
 * Определяет, является ли переданное значение экземпляром класса PrometheusMetric.
 * @param {*} value Проверяемое значение.
 * @return {boolean} Переданное значение является экземпляром класса PrometheusMetric?
 */
export const isPrometheusMetric = value => value instanceof PrometheusMetric;

/**
 * Класс объектов-адаптеров для классов метрик из пакета "prom-client".
 */
export class PrometheusMetric {
  /**
   * Инициализирует объект-адаптер метрики.
   * @param {string} metricType Тип метрики, определяемый названием класса из пакета "prom-client".
   * @param {Object} options Опции, передаваемые в конструктор метрики из пакета "prom-client".
   */
  constructor (metricType = '', options = {}) {
    if (!availableMetricTypes.includes(metricType)) {
      throw Error(`First argument must be one of available types: ${availableMetricTypes.join(', ')}`);
    }
    Object.assign(this, { ...options, metricType });
    this[originalMetricKey] = new PrometheusClient[metricType](options);
  }

  /**
   * Устанавливает значения показателей по переданному объекту, где ключ - название показателя.
   * @param {Object} labels Объект со значениями показателей по названиям.
   * @return {PrometheusMetric} Экземпляр.
   */
  setLabels (labels = {}) {
    if (Array.isArray(this.labelNames)) {
      const labelValues = [];

      Object.entries(labels || {}).forEach(entry => {
        const [labelName, labelValue] = entry;
        const labelNameIndex = this.labelNames.indexOf(labelName);
        if (labelNameIndex !== -1) {
          labelValues[labelNameIndex] = labelValue;
        }
      });

      if (labelValues.length === this.labelNames.length) {
        const instance = getOriginalInstance(this);
        instance.labels(...labelValues);
      } else {
        throw Error(`Labels count must be equal to labelNames count = ${this.labelNames.length}`);
      }
    }

    return this;
  }

  /**
   * Фиксирует показатель метрики в сервисе Prometheus.
   * @param {*} value Значение фиксируемого показателя, игнорируется для типа "Counter".
   * @return {PrometheusMetric} Экземпляр.
   */
  spot (value) {
    const instance = getOriginalInstance(this);

    switch (this.metricType) {
      case 'Counter':
        instance.inc(1);
        break;
      case 'Summary':
      case 'Histogram':
        instance.observe(value);
        break;
      case 'Gauge': {
        const isPositive = value > 0;
        const methodName = isPositive ? 'inc' : 'dec';
        instance[methodName](Math.abs(value));
        break;
      }
    }

    return this;
  }
}
