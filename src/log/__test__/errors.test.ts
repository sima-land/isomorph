import { DetailedError, Breadcrumb } from '..';

describe('DetailedError', () => {
  it('name should be just "Error"', () => {
    expect(new DetailedError('hello, world!').name).toBe('Error');
  });
});

describe('Breadcrumb', () => {
  it('name should be just "Error"', () => {
    expect(new Breadcrumb({ message: 'some text' }).data).toEqual({ message: 'some text' });
  });
});
