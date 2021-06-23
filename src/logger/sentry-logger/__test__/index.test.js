import sentryLogger from '..';
import { has } from 'lodash';

describe('sentryLogger()', function () {
  const sentryLoggerService = {
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    addBreadcrumb: jest.fn(),
    withScope: jest.fn(),
  };
  it('captureException, captureMessage, captureBreadcrumb works correctly', () => {
    const service = sentryLogger({ sentryLoggerService });

    service.captureException();
    expect(sentryLoggerService.captureException).toHaveBeenCalled();

    service.captureMessage();
    expect(sentryLoggerService.captureMessage).toHaveBeenCalled();

    service.captureBreadcrumb();
    expect(sentryLoggerService.addBreadcrumb).toHaveBeenCalled();
  });

  describe('captureExtendedException', () => {
    const error = new Error('test');
    const setExtra = jest.fn();
    const setContext = jest.fn();
    const setLevel = jest.fn();
    const scope = { setExtra, setContext, setLevel };
    it('works correctly w/o options', () => {
      const service = sentryLogger({ sentryLoggerService });

      service.captureExtendedException(error, 'test_data');
      sentryLoggerService.withScope.mock.calls[0][0](scope);

      expect(sentryLoggerService.withScope).toHaveBeenCalled();
      expect(setContext).not.toBeCalled();
      expect(setExtra).toHaveBeenCalledWith('details', 'test_data');
      expect(setLevel).not.toBeCalled();
      expect(sentryLoggerService.captureException).toHaveBeenCalledWith(error);
    });
    it('works correctly with dataName options', () => {
      const service = sentryLogger({ sentryLoggerService });

      service.captureExtendedException(error, 'test_data', { dataName: 'test_name', level: 'warning' });
      sentryLoggerService.withScope.mock.calls[0][0](scope);

      expect(sentryLoggerService.withScope).toHaveBeenCalled();
      expect(setContext).not.toBeCalled();
      expect(setExtra).toHaveBeenCalledWith('test_name', 'test_data');
      expect(setLevel).toHaveBeenCalledWith('warning');
      expect(sentryLoggerService.captureException).toHaveBeenCalledWith(error);
    });
    it('works correctly with dataAsContext options', () => {
      const service = sentryLogger({ sentryLoggerService });

      service.captureExtendedException(error, 'test_data', { dataAsContext: true });
      sentryLoggerService.withScope.mock.calls[0][0](scope);

      expect(sentryLoggerService.withScope).toHaveBeenCalled();
      expect(setExtra).not.toBeCalled();
      expect(setContext).toHaveBeenCalledWith('details', 'test_data');
      expect(setLevel).not.toBeCalled();
      expect(sentryLoggerService.captureException).toHaveBeenCalledWith(error);
    });
  });

  it('works correctly without params', () => {
    const service = sentryLogger();

    expect(has(service, 'captureException')).toBeTruthy();
    expect(has(service, 'captureMessage')).toBeTruthy();
    expect(has(service, 'captureBreadcrumb')).toBeTruthy();
    expect(has(service, 'captureExtendedException')).toBeTruthy();
  });
});
