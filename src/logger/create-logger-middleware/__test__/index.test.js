import createLoggerMiddleware from '..';
import createPinoLogger from '../../../helpers/logger/config-pino-logger';
import createPinoInstance from '../../../helpers/logger/create-pino-instance';

const config = { version: 1 };
const helpers = {
  getXClientIp: jest.fn(),
  getMethod: jest.fn(),
  getStatus: jest.fn(),
};

jest.mock('../../../helpers/logger/config-pino-logger', () => jest.fn());
jest.mock('../../../helpers/logger/create-pino-instance', () => jest.fn());

describe('createLoggerMiddleware', () => {
  it('works correctly', () => {
    createLoggerMiddleware({
      config,
      helpers,
    });

    expect(createPinoLogger).toHaveBeenCalledWith({
      logger: createPinoInstance({ config }),
      staticData: {
        version: config.version,
      },
      dynamicData: {
        remote_ip: helpers.getXClientIp,
        method: helpers.getMethod,
        status: helpers.getStatus,
      },
    });
    expect(createPinoInstance).toHaveBeenCalledWith({ config });
  });
});
