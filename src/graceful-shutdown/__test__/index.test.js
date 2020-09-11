import {
  createCloseHandler,
  createShutdownHandler,
  decorateGracefulShutdown,
  gracefulShutdownCreator,
  onExitHandlerCreator,
} from '../index.js';
import { EventEmitter } from 'events';

describe('createCloseHandler()', () => {
  it('should return function', () => {
    expect(typeof createCloseHandler()).toBe('function');
  });
  it('should return function that calls process.exit and callback', () => {
    const spy = jest.fn();
    const closeHandler = createCloseHandler(12, spy);
    jest.spyOn(process, 'exit').mockImplementation(() => {});
    expect(process.exit).toHaveBeenCalledTimes(0);
    expect(spy).toHaveBeenCalledTimes(0);

    closeHandler();
    expect(process.exit).toHaveBeenCalledTimes(1);
    expect(process.exit).toHaveBeenCalledWith(12);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(12);
  });
});

describe('createShutdownHandler()', () => {
  it('should return function', () => {
    expect(typeof createShutdownHandler()).toBe('function');
  });
  it('should return function that calls server.close and process.exit after timeout', () => {
    jest.useFakeTimers();
    jest.spyOn(process, 'exit').mockImplementation(() => {});

    const testServer = { close: jest.fn() };
    const testOptions = {
      onError: 'test-error-placeholder',
      onSuccess: 'test-success-placeholder',
      timeout: null,
    };
    const shutdownHandler = createShutdownHandler(testServer, testOptions);
    expect(testServer.close).toHaveBeenCalledTimes(0);
    shutdownHandler();
    expect(testServer.close).toHaveBeenCalledTimes(1);
    jest.runOnlyPendingTimers();
    expect(process.exit).toHaveBeenCalledTimes(1);
    expect(process.exit).toHaveBeenCalledWith(1);

    const closeCallback = testServer.close.mock.calls[0][0];
    closeCallback();
    expect(process.exit).toHaveBeenCalledTimes(2);
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});

describe('decorateGracefulShutdown()', () => {
  it('should call process.on', () => {
    jest.spyOn(process, 'on');
    decorateGracefulShutdown({}, {});
    expect(process.on).toHaveBeenCalledTimes(2);
    expect(process.on.mock.calls[0][0]).toBe('SIGTERM');
    expect(typeof process.on.mock.calls[0][1]).toBe('function');
    expect(process.on.mock.calls[1][0]).toBe('SIGINT');
    expect(typeof process.on.mock.calls[1][1]).toBe('function');
    expect(process.on.mock.calls[0][1]).toBe(process.on.mock.calls[1][1]);
  });
  it('should pass to process.on function that calls server.close', () => {
    const testServer = {
      close: jest.fn(),
    };
    jest.spyOn(process, 'on');
    jest.spyOn(process, 'exit');
    decorateGracefulShutdown(testServer, {});
    const closeHandler = process.on.mock.calls[0][1];

    expect(testServer.close).toHaveBeenCalledTimes(0);
    closeHandler();
    expect(testServer.close).toHaveBeenCalledTimes(1);

    expect(process.exit).toHaveBeenCalledTimes(0);
    jest.runOnlyPendingTimers();
    expect(process.exit).toHaveBeenCalledTimes(1);
  });
});

describe('onExitHandlerCreator', () => {
  const logger = { info: jest.fn() };
  it('creates onExitHandler without getConfig data correctly', () => {
    const handler = onExitHandlerCreator({
      logger,
      message: 'Some error message',
    });
    expect(logger.info).not.toHaveBeenCalled();
    handler();
    expect(logger.info).toHaveBeenCalledWith('Some error message');
  });
  it('creates onExitHandler with getConfig data correctly', () => {
    const handler = onExitHandlerCreator({
      logger,
      config: {
        isDevelopment: false,
      },
      message: 'Some error message',
    });
    expect(logger.info).not.toHaveBeenCalled();
    handler();
    expect(logger.info).not.toHaveBeenCalled();
  });
});

jest.mock('../index', () => {
  const original = jest.requireActual('../index');
  return {
    ...original,
    decorateGracefulShutdown: jest.fn(original.decorateGracefulShutdown),
  };
});

describe('gracefulShutdownCreator', () => {
  it('creates function for applying graceful shutdown to server', () => {
    const onExitError = jest.fn();
    const onExitSuccess = jest.fn();
    const applyShutdown = gracefulShutdownCreator({
      onExitError,
      onExitSuccess,
      processExitTimeout: 1000,
    });
    expect(applyShutdown).toBeInstanceOf(Function);
    expect(applyShutdown).toHaveLength(1);
  });
  it('creates function, which apply graceful shutdown to server and add handlers on process events', () => {
    const realProcessOn = process.on;
    process.on = jest.fn();
    const realProcessExit = process.exit;
    process.exit = jest.fn();
    const onExitError = jest.fn();
    const onExitSuccess = jest.fn();
    const applyShutdown = gracefulShutdownCreator({
      onExitError,
      onExitSuccess,
      processExitTimeout: 1000,
    });
    expect(decorateGracefulShutdown).not.toHaveBeenCalled();
    const server = new EventEmitter();
    server.close = jest.fn(callback => callback());
    applyShutdown(server);
    expect(server.close).not.toHaveBeenCalled();
    expect(onExitSuccess).not.toHaveBeenCalled();
    process.on.mock.calls[0][1]();
    expect(onExitSuccess).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalled();
    process.on = realProcessOn;
    process.exit = realProcessExit;
  });
});
