import merge from 'lodash/merge';

export const testSpan = {
  setTag: jest.fn().mockReturnThis(),
  setOperationName: jest.fn().mockReturnThis(),
  finish: jest.fn(),
  addTags: jest.fn().mockReturnThis(),
};

export const tracer = {
  name: `tracer created at ${Date.now()}`,
  startSpan: jest.fn(() => testSpan),
  extract: jest.fn((tag, headers) => headers.tracerId),
  inject: jest.fn((span, tag, headers) => merge(headers, { tracerId: 'test' })),
};
export const initTracerFromEnv = jest.fn(() => tracer);
