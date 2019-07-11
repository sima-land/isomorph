import PrometheusClient from 'prom-client';
import {
  availableMetricTypes,
  getOriginalInstance,
  isPrometheusMetric,
  originalMetricKey,
  PrometheusMetric,
} from '../metric-adapter.js';

describe('metric adapter logger', () => {
  const invalidValues = Object.freeze([
    undefined,
    null,
    false,
    124124,
    '123214',
    [],
    {},
  ]);
  it('availableMetricTypes should contains strings from "prom-client" namespace', () => {
    availableMetricTypes.forEach(metricType => {
      expect(PrometheusClient.hasOwnProperty(metricType)).toBe(true);
    });
  });
  it('originalMetricKey must be a symbol', () => {
    expect(typeof originalMetricKey).toBe('symbol');
  });
  it('isPrometheusMetric() should works properly', () => {
    const testMetric = new PrometheusMetric('Counter', {
      help: 'test',
      name: 'test',
    });
    expect(isPrometheusMetric(testMetric)).toBe(true);
    invalidValues.forEach(value => {
      expect(isPrometheusMetric(value)).toBe(false);
    });
  });
  it('getOriginalInstance() should works properly', () => {
    const testOriginalMetric = { testMetric: true };
    const testValue = {
      [originalMetricKey]: testOriginalMetric,
    };
    expect(getOriginalInstance(testValue)).toBe(testOriginalMetric);
    invalidValues.forEach(value => {
      expect(getOriginalInstance(value)).toBe(undefined);
    });
  });
});

describe('PrometheusMetric', () => {
  it('should throw Error when first argument is not available type', () => {
    expect(() => new PrometheusMetric(undefined)).toThrow(
      Error('First argument must be one of available types: Counter, Gauge, Histogram, Summary')
    );
    expect(() => new PrometheusMetric('Counter', {
      name: 'throw_test',
      help: 'throw test',
    })).not.toThrow();
  });
  it('should pass original metric in property with special symbol as key', () => {
    const testMetric = new PrometheusMetric('Histogram', {
      name: 'symbol_test',
      help: 'symbol test',
    });
    expect(testMetric[originalMetricKey] instanceof PrometheusClient.Histogram).toBe(true);
  });
  it('should assign options and metricType on adapter instance', () => {
    const testMetric = new PrometheusMetric('Counter', {
      name: 'assign_test',
      help: 'assign test',
    });
    expect(testMetric).toMatchObject({
      metricType: 'Counter',
      name: 'assign_test',
      help: 'assign test',
    });
  });
  it('setLabels() and spot() should return this', () => {
    const testMetric = new PrometheusMetric('Counter', {
      name: 'chaining_test',
      help: 'chaining test',
    });
    expect(testMetric.spot()).toBe(testMetric);
    expect(testMetric.setLabels()).toBe(testMetric);
  });
  it('setLabels() should create list of labels values when labelNames is Array', () => {
    const testMetric = new PrometheusMetric('Counter', {
      name: 'labels_test',
      help: 'labels test',
      labelNames: ['first', 'second'],
    });
    jest.spyOn(testMetric[originalMetricKey], 'labels');
    expect(testMetric[originalMetricKey].labels).toHaveBeenCalledTimes(0);

    testMetric.setLabels({ first: 1, second: 2 });
    expect(testMetric[originalMetricKey].labels).toHaveBeenCalledTimes(1);
    expect(testMetric[originalMetricKey].labels).toHaveBeenCalledWith(1, 2);
  });
  it('setLabels() should throw error when label values count is not equal to labelNames.length', () => {
    const testMetric = new PrometheusMetric('Counter', {
      name: 'labels_error_test',
      help: 'labels error test',
      labelNames: ['first', 'second'],
    });
    jest.spyOn(testMetric[originalMetricKey], 'labels');
    expect(() => testMetric.setLabels({ first: 1, third: 3 })).toThrow(
      Error('Labels count must be equal to labelNames count = 2')
    );
    expect(() => testMetric.setLabels(null)).toThrow(
      Error('Labels count must be equal to labelNames count = 2')
    );
  });
  it('spot() should call instance.inc() for "Counter" type', () => {
    const testMetric = new PrometheusMetric('Counter', {
      name: 'inc_test',
      help: 'inc test',
    });
    jest.spyOn(testMetric[originalMetricKey], 'inc');
    expect(testMetric[originalMetricKey].inc).toHaveBeenCalledTimes(0);

    testMetric.spot();
    expect(testMetric[originalMetricKey].inc).toHaveBeenCalledTimes(1);
    expect(testMetric[originalMetricKey].inc).toHaveBeenCalledWith(1);
  });
  it('spot() should call instance.inc() or dec() for "Gauge" types', () => {
    const testMetric = new PrometheusMetric('Gauge', {
      name: 'gauge_test',
      help: 'gauge test',
    });
    jest.spyOn(testMetric[originalMetricKey], 'inc');
    jest.spyOn(testMetric[originalMetricKey], 'dec');
    expect(testMetric[originalMetricKey].inc).toHaveBeenCalledTimes(0);

    testMetric.spot(12);
    expect(testMetric[originalMetricKey].inc).toHaveBeenCalledTimes(1);
    expect(testMetric[originalMetricKey].inc).toHaveBeenCalledWith(12);
    expect(testMetric[originalMetricKey].dec).toHaveBeenCalledTimes(0);

    testMetric.spot(-36);
    expect(testMetric[originalMetricKey].inc).toHaveBeenCalledTimes(1);
    expect(testMetric[originalMetricKey].dec).toHaveBeenCalledTimes(1);
    expect(testMetric[originalMetricKey].dec).toHaveBeenCalledWith(36);
  });
  it('spot() should call instance.observe() for "Summary" and Histogram" types', () => {
    const testTypes = ['Summary', 'Histogram'];
    testTypes.forEach(type => {
      const testMetric = new PrometheusMetric(type, {
        name: `${type}_spot_test`,
        help: `${type} spot test`,
      });
      jest.spyOn(testMetric[originalMetricKey], 'observe');
      expect(testMetric[originalMetricKey].observe).toHaveBeenCalledTimes(0);

      testMetric.spot(12);
      expect(testMetric[originalMetricKey].observe).toHaveBeenCalledTimes(1);
      expect(testMetric[originalMetricKey].observe).toHaveBeenCalledWith(12);
    });
  });
});
