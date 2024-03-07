import { Logger } from '../../../../log';
import { SagaLogging } from '../saga-logging';

describe('SagaLogging', () => {
  const logger: Logger = {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    subscribe: jest.fn(),
  };

  beforeEach(() => {
    (logger.info as jest.Mock).mockClear();
    (logger.error as jest.Mock).mockClear();
  });

  it('should handle saga error properly', () => {
    const handler = new SagaLogging(logger);

    expect(logger.error).toHaveBeenCalledTimes(0);
    handler.onSagaError(new Error('my test error'), { sagaStack: 'my test stack' });
    expect(logger.error).toHaveBeenCalledTimes(1);
  });

  it('should handle config error properly', () => {
    const handler = new SagaLogging(logger);
    const error = new Error('my test error');

    expect(logger.error).toHaveBeenCalledTimes(0);
    handler.onConfigError(error);
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith(error);
  });

  it('should handle timeout interrupt properly', () => {
    const handler = new SagaLogging(logger);
    const info = { timeout: 250 };

    expect(logger.error).toHaveBeenCalledTimes(0);
    handler.onTimeoutInterrupt(info);
    expect(logger.error).toHaveBeenCalledTimes(1);
  });
});
