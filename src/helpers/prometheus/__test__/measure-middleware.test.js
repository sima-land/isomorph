import { createMeasureMiddleware } from '../measure-middleware.js';
import { createObserveMiddleware, defaultFinishSubscriber, defaultStartSubscriber } from '../../../observe-middleware';
import { PrometheusMetric } from '../metric-adapter.js';

jest.mock('../../../observe-middleware/', () => {
  const original = jest.requireActual('../../../observe-middleware/');
  return {
    ...original,
    __esModule: true,
    createObserveMiddleware: jest.fn(original.createObserveMiddleware),
  };
});

describe('createMeasureMiddleware()', () => {
  it('should handle undefined arguments and props', () => {
    expect(() => createMeasureMiddleware()).not.toThrow();
    expect(() => createMeasureMiddleware(null)).not.toThrow();
    expect(() => createMeasureMiddleware({})).not.toThrow();
  });
  it('should throw error when "resolveLabels" is not a function', () => {
    const testOptions = {
      resolveLabels: null,
      startMetrics: [],
      finishMetrics: [],
    };
    expect(() => createMeasureMiddleware(testOptions)).toThrow(
      TypeError('First argument property "resolveLabels" must be a function')
    );
  });
  it('should throw error when "startMetrics" is not an array', () => {
    const testOptions = {
      resolveLabels: () => {
      },
      startMetrics: null,
      finishMetrics: [],
    };
    expect(() => createMeasureMiddleware(testOptions)).toThrow(
      TypeError('First argument properties "startMetrics" and "finishMetrics" must be arrays')
    );
  });
  it('should throw error when "finishMetrics" is not an array', () => {
    const testOptions = {
      resolveLabels: () => {
      },
      startMetrics: [],
      finishMetrics: 123,
    };
    expect(() => createMeasureMiddleware(testOptions)).toThrow(
      TypeError('First argument properties "startMetrics" and "finishMetrics" must be arrays')
    );
  });
  it('should throw error when "startMetrics" contains non metric', () => {
    const testOptions = {
      resolveLabels: () => {
      },
      startMetrics: [null],
      finishMetrics: [],
    };
    expect(() => createMeasureMiddleware(testOptions)).toThrow(
      TypeError('Every metric in "startMetrics" and "finishMetrics" must be instance of PrometheusMetric')
    );
  });
  it('should throw error when "finishMetrics" contains non metric', () => {
    const testOptions = {
      resolveLabels: () => {
      },
      startMetrics: [],
      finishMetrics: [undefined],
    };
    expect(() => createMeasureMiddleware(testOptions)).toThrow(
      TypeError('Every metric in "startMetrics" and "finishMetrics" must be instance of PrometheusMetric')
    );
  });
  it('should throw error when "startSubscriber" is not a function', () => {
    const testOptions = {
      resolveLabels: () => {
      },
      startMetrics: [],
      finishMetrics: [],
      startSubscriber: 'I am not a function',
    };
    expect(() => createMeasureMiddleware(testOptions)).toThrow(
      TypeError('First argument property "startSubscriber" must be a function')
    );
  });
  it('should throw error when "finishSubscriber" is not a function', () => {
    const testOptions = {
      resolveLabels: () => {
      },
      startMetrics: [],
      finishMetrics: [],
      startSubscriber: () => {
      },
      finishSubscriber: 'I am not a function',
    };
    expect(() => createMeasureMiddleware(testOptions)).toThrow(
      TypeError('First argument property "finishSubscriber" must be a function')
    );
  });
  it('should return result of createObserveMiddleware() when argument is valid', () => {
    const testOptions = {
      resolveLabels: () => {
      },
      startMetrics: [],
      finishMetrics: [],
    };
    expect(createObserveMiddleware).toHaveBeenCalledTimes(0);
    const middleware = createMeasureMiddleware(testOptions);
    expect(typeof middleware).toBe('function');
    expect(createObserveMiddleware).toHaveBeenCalledTimes(1);
    expect(typeof createObserveMiddleware.mock.calls[0][0].onStart).toBe('function');
    expect(typeof createObserveMiddleware.mock.calls[0][0].onFinish).toBe('function');
  });
  it('should pass callbacks to createObserveMiddleware that calls setLabels() and spot() for each metric', () => {
    jest.spyOn(process, 'hrtime').mockReturnValue([100, 2000000]);
    jest.spyOn(PrometheusMetric.prototype, 'setLabels');
    jest.spyOn(PrometheusMetric.prototype, 'spot');
    const startSubscriber = jest.fn(defaultStartSubscriber);
    const finishSubscriber = jest.fn(defaultFinishSubscriber);
    const testOptions = {
      resolveLabels: jest.fn(),
      startMetrics: [
        new PrometheusMetric('Counter', { name: 'test_start1', help: 'test start 1' }),
        new PrometheusMetric('Counter', { name: 'test_start2', help: 'test start 2' }),
      ],
      finishMetrics: [
        new PrometheusMetric('Counter', { name: 'test_finish', help: 'test finish' }),
      ],
      startSubscriber,
      finishSubscriber,
    };
    const middleware = createMeasureMiddleware(testOptions);
    const eventHandlers = [];
    const testRequest = { testRequest: true };
    const testResponse = { testResponse: true, once: (event, eventHandler) => eventHandlers.push(eventHandler) };

    expect(testOptions.resolveLabels).toHaveBeenCalledTimes(0);
    expect(PrometheusMetric.prototype.setLabels).toHaveBeenCalledTimes(0);
    expect(PrometheusMetric.prototype.spot).toHaveBeenCalledTimes(0);
    expect(startSubscriber).not.toHaveBeenCalled();
    expect(finishSubscriber).not.toHaveBeenCalled();

    // run middleware
    middleware(testRequest, testResponse, () => {
    });
    expect(startSubscriber).toHaveBeenCalledWith(
      {
        callback: expect.any(Function),
        request: testRequest,
        response: testResponse,
      }
    );
    expect(finishSubscriber).toHaveBeenCalledWith(
      {
        callback: expect.any(Function),
        request: testRequest,
        response: testResponse,
      }
    );
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
