import merge from 'lodash/merge';

export const testSpan = {
  setTag: jest.fn(),
  finish: jest.fn(),
};

export const tracer = {
  name: `tracer created at ${Date.now()}`,
  startSpan: jest.fn(() => testSpan),
  extract: jest.fn(),
  inject: jest.fn((span, tag, headers) => merge(headers, { tracerId: 'test' })),
};
export const initTracerFromEnv = jest.fn(() => tracer);
