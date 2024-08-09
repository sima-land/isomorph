import pino from 'pino';
import { createPinoHandler } from '../pino';
import { createLogger } from '../../logger';

describe('createPinoHandler', () => {
  it('should make handler properly', () => {
    const stub: pino.Logger = {
      info: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    } as unknown as pino.Logger;

    const logger = createLogger();

    logger.subscribe(createPinoHandler(stub));

    expect(stub.info).toHaveBeenCalledTimes(0);
    logger.info('AAA');
    expect(stub.info).toHaveBeenCalledTimes(1);
    expect(stub.info).toHaveBeenCalledWith('AAA');

    expect(stub.info).toHaveBeenCalledTimes(1);
    logger.log('AAA');
    expect(stub.info).toHaveBeenCalledTimes(2);
    expect(stub.info).toHaveBeenCalledWith('AAA');

    expect(stub.warn).toHaveBeenCalledTimes(0);
    logger.warn('BBB');
    expect(stub.warn).toHaveBeenCalledTimes(1);
    expect(stub.warn).toHaveBeenCalledWith('BBB');

    expect(stub.debug).toHaveBeenCalledTimes(0);
    logger.debug('CCC');
    expect(stub.debug).toHaveBeenCalledTimes(1);
    expect(stub.debug).toHaveBeenCalledWith('CCC');

    expect(stub.error).toHaveBeenCalledTimes(0);
    logger.error('DDD');
    expect(stub.error).toHaveBeenCalledTimes(1);
    expect(stub.error).toHaveBeenCalledWith('DDD');
  });
});
