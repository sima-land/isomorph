import { getMsFromHRT, isNumeric } from '../utils.js';

describe('getMsFromHRT()', () => {
  it('should return NaN for non valid hrtime', () => {
    const invalidValues = [
      '123214',
      124124,
      [],
      null,
      undefined,
      {},
    ];
    invalidValues.forEach(value => {
      expect(Object.is(NaN, getMsFromHRT(value))).toBe(true);
    });
  });
  it('should return number for valid hrtime', () => {
    expect(getMsFromHRT([100, 2000000])).toBe(100002);
  });
});

describe('isNumeric()', () => {
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
