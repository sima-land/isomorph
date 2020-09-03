import isNotEmptyString from '../is-not-empty-string';

describe('function isNotEmptyString()', () => {
  it('should return false for non empty string values', () => {
    const emptyStringOrNotStringValues = [
      '',
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
    emptyStringOrNotStringValues.forEach(testValue => {
      expect(isNotEmptyString(testValue)).toBe(false);
    });
  });

  const whitespaceValues = [
    ' ',
    ' \r',
    '\n ',
  ];
  it('should return true for string values contains only whitespaces', () => {
    whitespaceValues.forEach(testValue => {
      expect(isNotEmptyString(testValue, false)).toBe(true);
    });
  });

  const emptyStringValues = [
    '',
    ' ',
    ' \r',
    '\n ',
  ];
  it('should return false for empty string values', () => {
    emptyStringValues.forEach(testValue => {
      expect(isNotEmptyString(testValue)).toBe(false);
    });
  });
});
