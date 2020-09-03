import isNotEmptyArray from '../is-not-empty-array';

describe('function isNotEmptyArray()', () => {
  it('should return false for non empty array values', () => {
    const emptyArrayOrNotArrayValues = [
      'test',
      null,
      undefined,
      false,
      true,
      NaN,
      Symbol(),
      new Map(),
      () => {},
      [],
      {},
      Infinity,
    ];
    emptyArrayOrNotArrayValues.forEach(testValue => {
      expect(isNotEmptyArray(testValue)).toBe(false);
    });
  });
  it('should return true for not empty array values', () => {
    const arrayValues = [
      ['abc'],
    ];
    arrayValues.forEach(testValue => {
      expect(isNotEmptyArray(testValue)).toBe(true);
    });
  });
});
