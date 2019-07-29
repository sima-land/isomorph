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

const config = { version: 1 };
const dynamicData = {
  remote_ip: jest.fn().mockImplementation(() => '127.0.0.1'),
  method: jest.fn().mockImplementation(() => 'GET'),
  status: jest.fn().mockImplementation(() => 200),
};
const pinoLogger = {
  info: jest.fn(),
};

describe('createLoggerMiddleware', () => {
  it('should throw error "First argument property pinoLogger is empty."', () => {
    expect(() => createLoggerMiddleware())
      .toThrow(Error('First argument property "pinoLogger" is empty.'));
    expect(() => createLoggerMiddleware({
      config,
      dynamicData,
    }))
      .toThrow(Error('First argument property "pinoLogger" is empty.'));
    expect(createObserveMiddleware).toHaveBeenCalledTimes(0);
  });
  it('should throw error "Every data getter in dynamicData must be Function."', () => {
    expect(() => createLoggerMiddleware({
      config,
      pinoLogger,
      dynamicData: {
        foo: () => {},
        bar: 'string',
      },
    }))
      .toThrow(TypeError('Every data getter in "dynamicData" must be Function.'));
    expect(createObserveMiddleware).toHaveBeenCalledTimes(0);
    expect(() => createLoggerMiddleware({
      config,
      pinoLogger,
      dynamicData,
    }))
      .not.toThrow(TypeError('Every data getter in "dynamicData" must be Function.'));
    expect(createObserveMiddleware).toHaveBeenCalledTimes(1);
  });
  it('should return result of createObserveMiddleware()', () => {
    const middleware = createLoggerMiddleware({
      config,
      pinoLogger,
      dynamicData,
    });

    expect(typeof middleware).toBe('function');
    expect(createObserveMiddleware).toHaveBeenCalledTimes(1);
    expect(typeof createObserveMiddleware.mock.calls[0][0].onFinish).toBe('function');
  });
  it('should call info with correct dataset', () => {
    jest.spyOn(process, 'hrtime').mockReturnValue([100, 2000000]);
    const middleware = createLoggerMiddleware({
      config,
      pinoLogger,
      dynamicData,
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
});
