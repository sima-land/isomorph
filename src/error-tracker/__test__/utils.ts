import { SentryError } from '../utils';

describe('SentryError', () => {
  it('name should be just "Error"', () => {
    expect(new SentryError('hello, world!').name).toBe('Error');
  });
});
