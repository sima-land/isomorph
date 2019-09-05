import formatTime from '../../format-time';
import createPinoInstance from '..';
import pino from '../../../../../__mocks__/pino';

describe('createPinoInstance()', () => {
  it('creates the instance correctly when run as development', () => {
    const config = {
      isDevelopment: true,
      isProduction: false,
    };
    const loggerInstance = createPinoInstance({ config });

    expect(loggerInstance.extreme).toBeFalsy();
    expect(pino).toHaveBeenCalledWith({
      prettyPrint: { colorize: true },
      timestamp: formatTime,
      useLevelLabels: true,
    });
  });

  it('creates the instance correctly when run as production', () => {
    const config = {
      isDevelopment: false,
      isProduction: true,
    };
    const loggerInstance = createPinoInstance({ config });

    expect(loggerInstance.extreme).toBeTruthy();
    expect(pino).toHaveBeenCalledWith({
      prettyPrint: false,
      timestamp: formatTime,
      useLevelLabels: true,
    });
  });

  it('creates the instance correctly when run without params', () => {
    const loggerInstance = createPinoInstance();

    expect(loggerInstance.extreme).toBeTruthy();
    expect(pino).toHaveBeenCalledWith({
      prettyPrint: false,
      timestamp: formatTime,
      useLevelLabels: true,
    });
  });
});
