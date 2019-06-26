import configPinoLogger, {
  finishHandler,
} from '..';
import isFunction from '../../../../../__mocks__/lodash/isFunction';

jest.mock('../../hr-time-to-integer', () => ({
  hrtimeToInteger: jest.fn(() => 1234567891011121314),
}));

let response, request, options, next;

describe('configPinoLogger()', () => {
  beforeEach(() => {
    response = {
      on: jest.fn(),
      removeListener: jest.fn(),
    };
    request = {};
    next = jest.fn();
    options = {
      logger: {
        info: jest.fn(),
        log: jest.fn(),
      },
      staticData: { version: 1 },
      dynamicData: { method: jest.fn(() => 2) },
    };
  });

  it('works correctly', () => {
    const middleware = configPinoLogger(options);

    middleware(request, response, next);
    finishHandler.bind({
      ...middleware,
      ...response,
    })();

    expect(response.logData).toEqual({
      ...options.staticData,
      ...options.dynamicData,
    });
    expect(middleware).toBeInstanceOf(Function);
    expect(next).toHaveBeenCalled();
  });

  it('works correctly when next not a function', () => {
    next = {};
    const middleware = configPinoLogger(options);

    middleware(request, response, next);
    expect(isFunction).toHaveBeenCalled();
  });

  it('finish handler works correctly', () => {
    const localResponse = {
      ...response,
      logData: {
        ...options.staticData,
        ...options.dynamicData,
      },
      request,
      log: jest.fn(),
      startTime: 123456789101112131,
    };

    finishHandler.bind(localResponse)();

    expect(localResponse.log).toHaveBeenCalledWith({
      version: 1,
      method: 2,
      latency: 1111111101910.0093,
    });
    expect(options.dynamicData.method).toHaveBeenCalledWith({
      request,
      response: localResponse,
    });
  });

  it('works correctly when not passed data parameters', () => {
    const middleware = configPinoLogger({
      logger: options.logger,
    });

    middleware(request, response, next);
    expect(response.logData).toEqual({});
  });

  it('works correctly when not passed a parameter "logger"', () => {
    expect(() => configPinoLogger()).toThrowError();
  });
});
