export const Handlers = {
  requestHandler: jest.fn(),
  errorHandler: jest.fn(),
};

const Sentry = {
  init: jest.fn(),
  Handlers,
};

export default Sentry;
