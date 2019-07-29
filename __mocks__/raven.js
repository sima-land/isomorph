export const Raven = {
  install: jest.fn(),
  config: jest.fn(() => ({
    install: Raven.install,
  })),
  requestHandler: jest.fn(),
  errorHandler: jest.fn(),
};
export default Raven;
