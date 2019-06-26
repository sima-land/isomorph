export const tracer = {
  name: `tracer created at ${Date.now()}`,
  startSpan: jest.fn(() => ({ finish: jest.fn() })),
  extract: jest.fn(),
};
export const initTracerFromEnv = jest.fn(() => tracer);
