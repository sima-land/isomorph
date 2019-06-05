import createLoggerMiddleware from './index';

const config = { version: 1 };
const httpHelpers = {
  getXClientIp: jest.fn(),
  getMethod: jest.fn(),
  getStatus: jest.fn(),
};

describe('createLoggerMiddleware', () => {
  it('works correctly', () => {
    createLoggerMiddleware({
      config,
      httpHelpers,
    });
  });
});
