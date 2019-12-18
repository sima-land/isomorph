import sentryLogger from '..';

describe('sentryLogger()', function () {
  it('works correctly', () => {
    const sentryLoggerService = {
      captureException: jest.fn(),
      captureMessage: jest.fn(),
      addBreadcrumb: jest.fn(),
    };
    const service = sentryLogger({ sentryLoggerService });

    service.captureException();
    expect(sentryLoggerService.captureException).toHaveBeenCalled();

    service.captureMessage();
    expect(sentryLoggerService.captureMessage).toHaveBeenCalled();

    service.captureBreadcrumb();
    expect(sentryLoggerService.addBreadcrumb).toHaveBeenCalled();
  });

  it('works correctly without params', () => {
    const service = sentryLogger();

    expect(service.hasOwnProperty('captureException')).toBeTruthy();
    expect(service.hasOwnProperty('captureMessage')).toBeTruthy();
    expect(service.hasOwnProperty('captureBreadcrumb')).toBeTruthy();
  });
});
