import sentryLogger from '..';

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
    const scope = { setExtra, setContext };
    it('works correctly w/o options', () => {
      const service = sentryLogger({ sentryLoggerService });

      service.captureExtendedException(error, 'test_data');
      sentryLoggerService.withScope.mock.calls[0][0](scope);

      expect(sentryLoggerService.withScope).toHaveBeenCalled();
      expect(setContext).not.toBeCalled();
      expect(setExtra).toHaveBeenCalledWith('details', 'test_data');
      expect(sentryLoggerService.captureException).toHaveBeenCalledWith(error);
    });
    it('works correctly with dataName options', () => {
      const service = sentryLogger({ sentryLoggerService });

      service.captureExtendedException(error, 'test_data', { dataName: 'test_name' });
      sentryLoggerService.withScope.mock.calls[0][0](scope);

      expect(sentryLoggerService.withScope).toHaveBeenCalled();
      expect(setContext).not.toBeCalled();
      expect(setExtra).toHaveBeenCalledWith('test_name', 'test_data');
      expect(sentryLoggerService.captureException).toHaveBeenCalledWith(error);
    });
    it('works correctly with dataAsContext options', () => {
      const service = sentryLogger({ sentryLoggerService });

      service.captureExtendedException(error, 'test_data', { dataAsContext: true });
      sentryLoggerService.withScope.mock.calls[0][0](scope);

      expect(sentryLoggerService.withScope).toHaveBeenCalled();
      expect(setExtra).not.toBeCalled();
      expect(setContext).toHaveBeenCalledWith('details', 'test_data');
      expect(sentryLoggerService.captureException).toHaveBeenCalledWith(error);
    });
  });

  it('works correctly without params', () => {
    const service = sentryLogger();

    expect(service.hasOwnProperty('captureException')).toBeTruthy();
    expect(service.hasOwnProperty('captureMessage')).toBeTruthy();
    expect(service.hasOwnProperty('captureBreadcrumb')).toBeTruthy();
    expect(service.hasOwnProperty('captureExtendedException')).toBeTruthy();
  });
});
