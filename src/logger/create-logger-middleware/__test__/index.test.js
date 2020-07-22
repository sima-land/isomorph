import createLoggerMiddleware from '..';
import { createObserveMiddleware } from '../../../observe-middleware';

jest.mock('../../../observe-middleware/', () => {
  const original = jest.requireActual('../../../observe-middleware/');
  return {
    ...original,
    __esModule: true,
    createObserveMiddleware: jest.fn(original.createObserveMiddleware),
  };
});

const getDynamicData = () => ({
  remote_ip: '127.0.0.1',
  method: 'GET',
  status: 200,
  version: 1,
});
const pinoLogger = {
  info: jest.fn(),
};

describe('createLoggerMiddleware', () => {
  it('should throw error "First argument property pinoLogger is empty."', () => {
    expect(() => createLoggerMiddleware())
      .toThrow(Error('First argument property "pinoLogger" is empty.'));
    expect(() => createLoggerMiddleware({
      getDynamicData,
    }))
      .toThrow(Error('First argument property "pinoLogger" is empty.'));
    expect(createObserveMiddleware).toHaveBeenCalledTimes(0);
  });
  it('should throw error "getDynamicData" must be Function.', () => {
    expect(() => createLoggerMiddleware({
      pinoLogger,
      getDynamicData: {},
    }))
      .toThrow(TypeError('"getDynamicData" must be Function.'));
    expect(createObserveMiddleware).toHaveBeenCalledTimes(0);
    expect(() => createLoggerMiddleware({
      pinoLogger,
      getDynamicData,
    }))
      .not.toThrow(TypeError('"getDynamicData" must be Function.'));
    expect(createObserveMiddleware).toHaveBeenCalledTimes(1);
  });
  it('should throw error "exclusions" must be array.', () => {
    expect(() => createLoggerMiddleware({
      pinoLogger,
      getDynamicData,
      exclusions: {},
    }))
      .toThrow(TypeError('"exclusions" must be array.'));
    expect(createObserveMiddleware).toHaveBeenCalledTimes(0);
    expect(() => createLoggerMiddleware({
      pinoLogger,
      getDynamicData,
    }))
      .not.toThrow(TypeError('"exclusions" must be array.'));
    expect(createObserveMiddleware).toHaveBeenCalledTimes(1);
  });
  it('should return result of createObserveMiddleware()', () => {
    const middleware = createLoggerMiddleware({
      pinoLogger,
      getDynamicData,
    });

    expect(typeof middleware).toBe('function');
    expect(createObserveMiddleware).toHaveBeenCalledTimes(1);
    expect(typeof createObserveMiddleware.mock.calls[0][0].onFinish).toBe('function');
  });
  it('should call info with correct dataset', () => {
    jest.spyOn(process, 'hrtime').mockReturnValue([100, 2000000]);
    const middleware = createLoggerMiddleware({
      pinoLogger,
      getDynamicData,
    });
    const eventHandlers = [];
    const testRequest = { testRequest: true };
    const testResponse = { testResponse: true, once: (event, eventHandler) => eventHandlers.push(eventHandler) };

    middleware(testRequest, testResponse, () => {});
    expect(pinoLogger.info).toHaveBeenCalledTimes(0);

    // emit finish handler
    eventHandlers.forEach(handler => handler());
    expect(pinoLogger.info).toHaveBeenCalledTimes(1);
    expect(pinoLogger.info).toHaveBeenCalledWith({
      version: 1,
      remote_ip: '127.0.0.1',
      method: 'GET',
      status: 200,
      latency: 100002.,
    });
  });

  it('should call dynamicData width request and response', () => {
    const spy = jest.fn();
    const middleware = createLoggerMiddleware({
      pinoLogger,
      getDynamicData: spy,
    });
    const eventHandlers = [];
    const testRequest = { testRequest: true };
    const testResponse = { testResponse: true, once: (event, eventHandler) => eventHandlers.push(eventHandler) };

    middleware(testRequest, testResponse, () => {});
    eventHandlers.forEach(handler => handler());

    expect(spy).toHaveBeenCalledWith(testRequest, testResponse);
  });

  it('shouldn`t call pinoLogger.info method with for url in exclusions array', () => {
    const middleware = createLoggerMiddleware({
      pinoLogger,
      getDynamicData,
      exclusions: ['test'],
    });
    const eventHandlers = [];
    const testRequest = { testRequest: true, originalUrl: '/test/url' };
    const testResponse = { testResponse: true, once: (event, eventHandler) => eventHandlers.push(eventHandler) };

    middleware(testRequest, testResponse, () => {});
    eventHandlers.forEach(handler => handler());

    expect(pinoLogger.info).toHaveBeenCalledTimes(0);
  });
});
