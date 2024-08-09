import { createSentryHandler } from '../sentry';
import { createLogger } from '../../logger';
import { Breadcrumb, DetailedError } from '../../errors';
import type { Scope } from '@sentry/types';

describe('createSentryHandler', () => {
  it('should handle function as scopeInit', () => {
    const scope: Scope = {
      setLevel: jest.fn(),
      setContext: jest.fn(),
      setExtra: jest.fn(),
      captureException: jest.fn(),
      addBreadcrumb: jest.fn(),
    } as unknown as Scope;

    const getScope = jest.fn(() => scope);

    const logger = createLogger();

    logger.subscribe(createSentryHandler(getScope));

    expect(scope.captureException).toHaveBeenCalledTimes(0);
    logger.error('fake error 1');
    logger.error('fake error 2');
    logger.error('fake error 3');
    expect(scope.captureException).toHaveBeenCalledTimes(3);
  });

  it('should make handler properly', () => {
    const scope: Scope = {
      setLevel: jest.fn(),
      setContext: jest.fn(),
      setExtra: jest.fn(),
      captureException: jest.fn(),
      addBreadcrumb: jest.fn(),
    } as unknown as Scope;

    const logger = createLogger();

    logger.subscribe(createSentryHandler(scope));

    // error level with non DetailedError
    expect(scope.captureException).toHaveBeenCalledTimes(0);
    logger.error('fake error');
    expect(scope.captureException).toHaveBeenCalledTimes(1);
    expect(scope.captureException).toHaveBeenCalledWith('fake error');

    // error level with DetailedError with defined level
    const error = new DetailedError('fake', { level: 'fatal' });
    expect(scope.setLevel).toHaveBeenCalledTimes(0);
    expect(scope.captureException).toHaveBeenCalledTimes(1);
    logger.error(error);
    expect(scope.setLevel).toHaveBeenCalledTimes(1);
    expect(scope.captureException).toHaveBeenCalledTimes(2);
    expect(scope.captureException).toHaveBeenCalledWith(error);

    // error level with DetailedError with defined context
    const error2 = new DetailedError('fake', { context: { key: 'CTX', data: {} } });
    expect(scope.setContext).toHaveBeenCalledTimes(0);
    expect(scope.captureException).toHaveBeenCalledTimes(2);
    logger.error(error2);
    expect(scope.setContext).toHaveBeenCalledTimes(1);
    expect(scope.captureException).toHaveBeenCalledTimes(3);
    expect(scope.captureException).toHaveBeenCalledWith(error2);

    // error level with DetailedError with defined context as array
    const error3 = new DetailedError('fake', { context: [{ key: 'CTX', data: {} }] });
    expect(scope.setContext).toHaveBeenCalledTimes(1);
    expect(scope.captureException).toHaveBeenCalledTimes(3);
    logger.error(error3);
    expect(scope.setContext).toHaveBeenCalledTimes(2);
    expect(scope.captureException).toHaveBeenCalledTimes(4);
    expect(scope.captureException).toHaveBeenCalledWith(error3);

    // error level with DetailedError with defined extra
    const error4 = new DetailedError('fake', { extra: { key: 'EXTRA', data: {} } });
    expect(scope.setExtra).toHaveBeenCalledTimes(0);
    expect(scope.captureException).toHaveBeenCalledTimes(4);
    logger.error(error4);
    expect(scope.setExtra).toHaveBeenCalledTimes(1);
    expect(scope.captureException).toHaveBeenCalledTimes(5);
    expect(scope.captureException).toHaveBeenCalledWith(error4);

    // non error level with non Breadcrumb
    expect(scope.captureException).toHaveBeenCalledTimes(5);
    logger.info('hello');
    expect(scope.captureException).toHaveBeenCalledTimes(5);

    // non error level with Breadcrumb
    const breadcrumb = new Breadcrumb({ category: 'test' });
    expect(scope.addBreadcrumb).toHaveBeenCalledTimes(0);
    logger.info(breadcrumb);
    expect(scope.addBreadcrumb).toHaveBeenCalledTimes(1);
    expect(scope.addBreadcrumb).toHaveBeenCalledWith(breadcrumb.data);
  });
});
