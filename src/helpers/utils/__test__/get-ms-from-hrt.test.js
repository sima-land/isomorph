import getMsFromHRT from '../get-ms-from-hrt';

describe('function getMsFromHRT()', () => {
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
