import createLoggerMiddleware from '..';
import createPinoLogger from '../../helpers/config-pino-logger';
import createPinoInstance from '../../helpers/create-pino-instance';

const config = { version: 1 };
const httpHelpers = {
  getXClientIp: jest.fn(),
  getMethod: jest.fn(),
  getStatus: jest.fn(),
};

jest.mock('../../helpers/config-pino-logger', () => jest.fn());
jest.mock('../../helpers/create-pino-instance', () => jest.fn());

describe('createLoggerMiddleware', () => {
  it('works correctly', () => {
    createLoggerMiddleware({
      config,
      httpHelpers,
    });

    expect(createPinoLogger).toHaveBeenCalledWith({
      logger: createPinoInstance({ config }),
      staticData: {
        version: config.version,
      },
      dynamicData: {
        remote_ip: httpHelpers.getXClientIp,
        method: httpHelpers.getMethod,
        status: httpHelpers.getStatus,
      },
    });
    expect(createPinoInstance).toHaveBeenCalledWith({ config });
  });
});
