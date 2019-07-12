import isNumeric from '../is-numeric';

describe('function isNumeric()', () => {
  it('should return false for non numeric values', () => {
    const nonNumericValues = [
      'test',
      null,
      undefined,
      false,
      true,
      NaN,
      Symbol(),
      () => {},
      [],
      {},
      Infinity,
    ];
    nonNumericValues.forEach(testValue => {
      expect(isNumeric(testValue)).toBe(false);
    });
  });
  it('should return true for numeric values', () => {
    const numericValues = [
      '123.456',
      123.456,
      123,
      123n,
    ];
    numericValues.forEach(testValue => {
      expect(isNumeric(testValue)).toBe(true);
    });
  });
});
