import { createRequestMiddleware } from '../request-middleware.js';
import { createObserveMiddleware } from '../../observe-middleware/';
import { PrometheusMetric } from '../metric-adapter.js';

jest.mock('../../observe-middleware/', () => {
  const original = jest.requireActual('../../observe-middleware/');
  return {
    ...original,
    __esModule: true,
    createObserveMiddleware: jest.fn(original.createObserveMiddleware),
  };
});

describe('createRequestMiddleware()', () => {
  it('should handle undefined arguments and props', () => {
    expect(() => createRequestMiddleware()).not.toThrow();
    expect(() => createRequestMiddleware(null)).not.toThrow();
    expect(() => createRequestMiddleware({})).not.toThrow();
  });
  it('should throw error when "resolveLabels" is not a function', () => {
    const testOptions = {
      resolveLabels: null,
      startMetrics: [],
      finishMetrics: [],
    };
    expect(() => createRequestMiddleware(testOptions)).toThrow(
      Error('First argument property "resolveLabels" must be a function')
    );
  });
  it('should throw error when "startMetrics" is not an array', () => {
    const testOptions = {
      resolveLabels: () => {},
      startMetrics: null,
      finishMetrics: [],
    };
    expect(() => createRequestMiddleware(testOptions)).toThrow(
      Error('First argument properties "startMetrics" and "finishMetrics" must be arrays')
    );
  });
  it('should throw error when "finishMetrics" is not an array', () => {
    const testOptions = {
      resolveLabels: () => {},
      startMetrics: [],
      finishMetrics: 123,
    };
    expect(() => createRequestMiddleware(testOptions)).toThrow(
      Error('First argument properties "startMetrics" and "finishMetrics" must be arrays')
    );
  });
  it('should throw error when "startMetrics" contains non metric', () => {
    const testOptions = {
      resolveLabels: () => {},
      startMetrics: [null],
      finishMetrics: [],
    };
    expect(() => createRequestMiddleware(testOptions)).toThrow(
      Error('Every metric in "startMetrics" and "finishMetrics" must be instance of PrometheusMetric')
    );
  });
  it('should throw error when "finishMetrics" contains non metric', () => {
    const testOptions = {
      resolveLabels: () => {},
      startMetrics: [],
      finishMetrics: [undefined],
    };
    expect(() => createRequestMiddleware(testOptions)).toThrow(
      Error('Every metric in "startMetrics" and "finishMetrics" must be instance of PrometheusMetric')
    );
  });
  it('should return result of createObserveMiddleware() when argument is valid', () => {
    const testOptions = {
      resolveLabels: () => {},
      startMetrics: [],
      finishMetrics: [],
    };
    expect(createObserveMiddleware).toHaveBeenCalledTimes(0);
    const middleware = createRequestMiddleware(testOptions);
    expect(typeof middleware).toBe('function');
    expect(createObserveMiddleware).toHaveBeenCalledTimes(1);
    expect(typeof createObserveMiddleware.mock.calls[0][0].onStart).toBe('function');
    expect(typeof createObserveMiddleware.mock.calls[0][0].onFinish).toBe('function');
  });
  it('should pass callbacks to createObserveMiddleware that calls setLabels() and spot() for each metric', () => {
    jest.spyOn(process, 'hrtime').mockReturnValue([100, 2000000]);
    jest.spyOn(PrometheusMetric.prototype, 'setLabels');
    jest.spyOn(PrometheusMetric.prototype, 'spot');
    const testOptions = {
      resolveLabels: jest.fn(),
      startMetrics: [
        new PrometheusMetric('Counter', { name: 'test_start1', help: 'test start 1' }),
        new PrometheusMetric('Counter', { name: 'test_start2', help: 'test start 2' }),
      ],
      finishMetrics: [
        new PrometheusMetric('Counter', { name: 'test_finish', help: 'test finish' }),
      ],
    };
    const middleware = createRequestMiddleware(testOptions);
    const eventHandlers = [];
    const testRequest = { testRequest: true };
    const testResponse = { testResponse: true, once: (event, eventHandler) => eventHandlers.push(eventHandler) };

    expect(testOptions.resolveLabels).toHaveBeenCalledTimes(0);
    expect(PrometheusMetric.prototype.setLabels).toHaveBeenCalledTimes(0);
    expect(PrometheusMetric.prototype.spot).toHaveBeenCalledTimes(0);

    // run middleware
    middleware(testRequest, testResponse, () => {});
    expect(testOptions.resolveLabels).toHaveBeenCalledTimes(2);
    expect(PrometheusMetric.prototype.setLabels).toHaveBeenCalledTimes(2);
    expect(PrometheusMetric.prototype.spot).toHaveBeenCalledTimes(2);
    expect(testOptions.resolveLabels.mock.calls[0][0]).toEqual({
      dependencies: testOptions,
      metric: testOptions.startMetrics[0],
      request: testRequest,
      response: testResponse,
      timestamp: 100002,
    });
    expect(testOptions.resolveLabels.mock.calls[1][0]).toEqual({
      dependencies: testOptions,
      metric: testOptions.startMetrics[1],
      request: testRequest,
      response: testResponse,
      timestamp: 100002,
    });

    // emit finish event
    eventHandlers.forEach(handler => handler());
    expect(testOptions.resolveLabels).toHaveBeenCalledTimes(3);
    expect(PrometheusMetric.prototype.setLabels).toHaveBeenCalledTimes(3);
    expect(PrometheusMetric.prototype.spot).toHaveBeenCalledTimes(3);
    expect(testOptions.resolveLabels.mock.calls[2][0]).toEqual({
      dependencies: testOptions,
      metric: testOptions.finishMetrics[0],
      request: testRequest,
      response: testResponse,
      duration: 100002,
    });
  });
});
