export const Handlers = {
  requestHandler: jest.fn(),
  errorHandler: jest.fn(),
};

const Sentry = {
  init: jest.fn(),
  Handlers,
  captureException: jest.fn(),
  configureScope: jest.fn(),
};

export default Sentry;
