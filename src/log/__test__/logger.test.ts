import { createLogger } from '..';

describe('createLogger', () => {
  it('should return logger', () => {
    const events: any[] = [];
    const logger = createLogger();

    logger.subscribe(event => events.push(event));

    logger.log('a');
    logger.info('b');
    logger.error('c');
    logger.warn('d');
    logger.debug('e');

    expect(events).toEqual([
      { type: 'log', data: 'a' },
      { type: 'info', data: 'b' },
      { type: 'error', data: 'c' },
      { type: 'warn', data: 'd' },
      { type: 'debug', data: 'e' },
    ]);
  });
});
