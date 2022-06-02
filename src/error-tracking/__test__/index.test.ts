import { SentryError, SentryBreadcrumb } from '..';

describe('SentryError', () => {
  it('name should be just "Error"', () => {
    expect(new SentryError('hello, world!').name).toBe('Error');
  });
});

describe('SentryBreadcrumb', () => {
  it('name should be just "Error"', () => {
    expect(new SentryBreadcrumb({ message: 'some text' }).data).toEqual({ message: 'some text' });
  });
});
